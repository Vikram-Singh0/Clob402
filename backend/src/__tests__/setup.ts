// Test setup file
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.APTOS_NETWORK = 'testnet';
process.env.FACILITATOR_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001';
process.env.MODULE_ADDRESS = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
process.env.PORT = '3001';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

// Increase timeout for blockchain interactions
jest.setTimeout(30000);

