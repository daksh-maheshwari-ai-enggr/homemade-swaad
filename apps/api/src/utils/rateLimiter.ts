import { redis } from './redisClient';

// Token bucket for rate limiting
// Max 3 tokens per user, refills 1 token per 60 seconds
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const MAX_TOKENS = 3;
const REFILL_INTERVAL = 60000; // 60 seconds
const tokenBuckets = new Map<string, TokenBucket>();

/**
 * Check if request should be rate limited using token bucket algorithm
 * @param key - Unique identifier (email or phone)
 * @returns true if allowed, false if rate limited
 */
export async function rateLimit(key: string): Promise<boolean> {
  const now = Date.now();
  let bucket: TokenBucket;

  // Get from map or create new
  const existingBucket = tokenBuckets.get(key);
  
  if (existingBucket) {
    bucket = existingBucket;
    
    // Calculate tokens to add based on time passed
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(timePassed / REFILL_INTERVAL);
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now - (timePassed % REFILL_INTERVAL);
    }
  } else {
    bucket = { tokens: MAX_TOKENS - 1, lastRefill: now };
    tokenBuckets.set(key, bucket);
  }

  // Check if we can consume a token
  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}

/**
 * Reset rate limit for a user (after successful OTP)
 */
export function resetRateLimit(key: string): void {
  tokenBuckets.set(key, { tokens: MAX_TOKENS, lastRefill: Date.now() });
}