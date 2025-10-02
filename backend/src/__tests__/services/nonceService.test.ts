import {
  isNonceUsed,
  markNonceUsed,
  validateNonceAndExpiry,
  generateNonce,
  generateExpiry,
} from '../../services/nonceService';
import * as aptosService from '../../services/aptosService';

// Mock the aptosService
jest.mock('../../services/aptosService');

describe('NonceService', () => {
  const TEST_USER_ADDRESS = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateNonce', () => {
    it('should generate a unique nonce', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      
      expect(nonce1).toBeGreaterThan(0);
      expect(nonce2).toBeGreaterThan(0);
      expect(nonce1).not.toBe(nonce2);
    });

    it('should generate a nonce with sufficient entropy', () => {
      const nonces = new Set<number>();
      for (let i = 0; i < 100; i++) {
        nonces.add(generateNonce());
      }
      
      // All nonces should be unique
      expect(nonces.size).toBe(100);
    });
  });

  describe('generateExpiry', () => {
    it('should generate expiry timestamp 5 minutes in the future by default', () => {
      const now = Math.floor(Date.now() / 1000);
      const expiry = generateExpiry();
      
      expect(expiry).toBeGreaterThan(now);
      expect(expiry).toBeLessThanOrEqual(now + 5 * 60 + 1);
    });

    it('should generate custom expiry time', () => {
      const now = Math.floor(Date.now() / 1000);
      const expiry = generateExpiry(10);
      
      expect(expiry).toBeGreaterThan(now + 9 * 60);
      expect(expiry).toBeLessThanOrEqual(now + 10 * 60 + 1);
    });
  });

  describe('isNonceUsed', () => {
    it('should return false for unused nonce', async () => {
      (aptosService.isNonceUsed as jest.Mock).mockResolvedValue(false);
      
      const result = await isNonceUsed(TEST_USER_ADDRESS, 12345);
      
      expect(result).toBe(false);
      expect(aptosService.isNonceUsed).toHaveBeenCalledWith(TEST_USER_ADDRESS, 12345);
    });

    it('should return true for used nonce', async () => {
      (aptosService.isNonceUsed as jest.Mock).mockResolvedValue(true);
      
      const result = await isNonceUsed(TEST_USER_ADDRESS, 12345);
      
      expect(result).toBe(true);
    });

    it('should cache used nonces', async () => {
      (aptosService.isNonceUsed as jest.Mock).mockResolvedValue(true);
      
      // First call
      await isNonceUsed(TEST_USER_ADDRESS, 12345);
      
      // Second call should use cache
      const result = await isNonceUsed(TEST_USER_ADDRESS, 12345);
      
      expect(result).toBe(true);
      // Should only call on-chain check once due to caching
      expect(aptosService.isNonceUsed).toHaveBeenCalledTimes(1);
    });
  });

  describe('markNonceUsed', () => {
    it('should mark nonce as used in cache', async () => {
      (aptosService.isNonceUsed as jest.Mock).mockResolvedValue(false);
      
      markNonceUsed(TEST_USER_ADDRESS, 99999);
      
      // Check cache directly without on-chain call
      const result = await isNonceUsed(TEST_USER_ADDRESS, 99999);
      expect(result).toBe(true);
    });
  });

  describe('validateNonceAndExpiry', () => {
    it('should validate fresh nonce with valid expiry', async () => {
      (aptosService.isNonceUsed as jest.Mock).mockResolvedValue(false);
      const futureExpiry = Math.floor(Date.now() / 1000) + 300;
      
      const result = await validateNonceAndExpiry(TEST_USER_ADDRESS, 12345, futureExpiry);
      
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject expired nonce', async () => {
      const pastExpiry = Math.floor(Date.now() / 1000) - 100;
      
      const result = await validateNonceAndExpiry(TEST_USER_ADDRESS, 12345, pastExpiry);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Authorization expired');
    });

    it('should reject already used nonce', async () => {
      (aptosService.isNonceUsed as jest.Mock).mockResolvedValue(true);
      const futureExpiry = Math.floor(Date.now() / 1000) + 300;
      
      const result = await validateNonceAndExpiry(TEST_USER_ADDRESS, 12345, futureExpiry);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Nonce already used (replay attack)');
    });
  });
});

