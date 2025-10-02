import request from 'supertest';
import app from '../../index';

describe('Health Check Integration Tests', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('facilitatorAddress');
      expect(response.body).toHaveProperty('network');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app).get('/health');

      const timestamp = new Date(response.body.timestamp);
      const now = new Date();
      const diffMs = Math.abs(now.getTime() - timestamp.getTime());
      
      // Timestamp should be within 5 seconds of current time
      expect(diffMs).toBeLessThan(5000);
    });

    it('should return consistent data', async () => {
      const response1 = await request(app).get('/health');
      const response2 = await request(app).get('/health');

      // Facilitator address and network should be consistent
      expect(response1.body.facilitatorAddress).toBe(response2.body.facilitatorAddress);
      expect(response1.body.network).toBe(response2.body.network);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});

