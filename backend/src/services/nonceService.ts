import { isNonceUsed as checkNonceOnChain } from './aptosService';
import { logger } from '../utils/logger';

// In-memory cache for performance (optional: use Redis for production)
const nonceCache = new Map<string, Set<number>>();

/**
 * Check if a nonce has been used by a user
 */
export async function isNonceUsed(userAddress: string, nonce: number): Promise<boolean> {
  // Check in-memory cache first
  const userNonces = nonceCache.get(userAddress);
  if (userNonces && userNonces.has(nonce)) {
    logger.info('Nonce found in cache (already used)', { userAddress, nonce });
    return true;
  }

  // Check on-chain
  const usedOnChain = await checkNonceOnChain(userAddress, nonce);
  if (usedOnChain) {
    markNonceUsed(userAddress, nonce);
  }

  return usedOnChain;
}

/**
 * Mark a nonce as used (in cache)
 */
export function markNonceUsed(userAddress: string, nonce: number): void {
  if (!nonceCache.has(userAddress)) {
    nonceCache.set(userAddress, new Set());
  }
  nonceCache.get(userAddress)!.add(nonce);
  logger.info('Nonce marked as used in cache', { userAddress, nonce });
}

/**
 * Validate nonce and expiry
 */
export async function validateNonceAndExpiry(
  userAddress: string,
  nonce: number,
  expiry: number
): Promise<{ valid: boolean; reason?: string }> {
  // Check expiry
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime > expiry) {
    return { valid: false, reason: 'Authorization expired' };
  }

  // Check if nonce already used
  const used = await isNonceUsed(userAddress, nonce);
  if (used) {
    return { valid: false, reason: 'Nonce already used (replay attack)' };
  }

  return { valid: true };
}

/**
 * Generate a fresh nonce
 */
export function generateNonce(): number {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

/**
 * Generate expiry timestamp (default: 5 minutes from now)
 */
export function generateExpiry(minutesFromNow: number = 5): number {
  return Math.floor(Date.now() / 1000) + minutesFromNow * 60;
}

