import request from 'supertest';
import express from 'express';
import { paymentAuthRouter } from '../../routes/paymentAuth';
import * as aptosService from '../../services/aptosService';
import * as nonceService from '../../services/nonceService';

// Mock dependencies
jest.mock('../../services/aptosService');
jest.mock('../../services/nonceService');

const app = express();
app.use(express.json());
app.use('/api/auth', paymentAuthRouter);

describe('Payment Auth Routes', () => {
  const TEST_ADDRESS = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/request-intent', () => {
    it('should return payment intent with 402 status', async () => {
      const mockNonce = 123456789;
      const mockExpiry = Math.floor(Date.now() / 1000) + 300;
      
      (nonceService.generateNonce as jest.Mock).mockReturnValue(mockNonce);
      (nonceService.generateExpiry as jest.Mock).mockReturnValue(mockExpiry);

      const response = await request(app)
        .post('/api/auth/request-intent')
        .send({
          sender: TEST_ADDRESS,
          recipient: '0xrecipient',
          amount: 1000000,
        });

      expect(response.status).toBe(402);
      expect(response.body).toHaveProperty('paymentRequired', true);
      expect(response.body).toHaveProperty('intent');
      expect(response.body.intent).toHaveProperty('nonce', mockNonce);
      expect(response.body.intent).toHaveProperty('expiry', mockExpiry);
    });

    it('should reject request without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/request-intent')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/submit-authorization', () => {
    const validPayload = {
      sender: TEST_ADDRESS,
      recipient: '0xrecipient',
      amount: 1000000,
      nonce: 12345,
      expiry: Math.floor(Date.now() / 1000) + 300,
      signature: '0xabcd',
      publicKey: '0x1234',
    };

    it('should submit valid payment authorization', async () => {
      const mockTxHash = '0xtxhash123';
      
      (nonceService.validateNonceAndExpiry as jest.Mock).mockResolvedValue({ valid: true });
      (aptosService.verifyPaymentSignature as jest.Mock).mockReturnValue(true);
      (aptosService.submitSponsoredPaymentAuth as jest.Mock).mockResolvedValue(mockTxHash);

      const response = await request(app)
        .post('/api/auth/submit-authorization')
        .send(validPayload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('transactionHash', mockTxHash);
      expect(response.body).toHaveProperty('explorer');
    });

    it('should reject expired authorization', async () => {
      (nonceService.validateNonceAndExpiry as jest.Mock).mockResolvedValue({
        valid: false,
        reason: 'Authorization expired',
      });

      const response = await request(app)
        .post('/api/auth/submit-authorization')
        .send(validPayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid authorization');
      expect(response.body).toHaveProperty('reason', 'Authorization expired');
    });

    it('should reject invalid signature', async () => {
      (nonceService.validateNonceAndExpiry as jest.Mock).mockResolvedValue({ valid: true });
      (aptosService.verifyPaymentSignature as jest.Mock).mockReturnValue(false);

      const response = await request(app)
        .post('/api/auth/submit-authorization')
        .send(validPayload);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid signature');
    });

    it('should reject submission with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/submit-authorization')
        .send({ sender: TEST_ADDRESS });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });
  });

  describe('GET /api/auth/status/:txHash', () => {
    it('should return transaction status', async () => {
      const txHash = '0xtxhash123';

      const response = await request(app).get(`/api/auth/status/${txHash}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('transactionHash', txHash);
      expect(response.body).toHaveProperty('status');
    });
  });
});

