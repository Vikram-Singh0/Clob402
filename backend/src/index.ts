import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { paymentAuthRouter } from './routes/paymentAuth';
import { orderBookRouter } from './routes/orderBook';
import { vaultRouter } from './routes/vault';
import { aptosClient, facilitatorAccount } from './services/aptosService';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    facilitatorAddress: facilitatorAccount.accountAddress.toString(),
    network: process.env.APTOS_NETWORK,
  });
});

// API Routes
app.use('/api/auth', paymentAuthRouter);
app.use('/api/orders', orderBookRouter);
app.use('/api/vault', vaultRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Facilitator backend running on port ${PORT}`);
  logger.info(`Network: ${process.env.APTOS_NETWORK}`);
  logger.info(`Facilitator address: ${facilitatorAccount.accountAddress.toString()}`);
});

export default app;

