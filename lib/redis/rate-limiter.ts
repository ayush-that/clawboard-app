import { getRedisClient } from "./client";

const PREFIX = "clawboard:ratelimit:";

/**
 * Sliding-window rate limiter using Redis sorted sets.
 * Returns { allowed, remaining, resetMs }.
 */
export const checkRateLimit = async (opts: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ allowed: boolean; remaining: number; resetMs: number }> => {
  const { key, limit, windowMs } = opts;
  const redisKey = `${PREFIX}${key}`;
  const redis = await getRedisClient();
  const now = Date.now();
  const windowStart = now - windowMs;

  // Atomic pipeline: remove expired, add current, count, set expiry
  const results = await redis
    .multi()
    .zRemRangeByScore(redisKey, 0, windowStart)
    .zAdd(redisKey, { score: now, value: `${now}:${Math.random()}` })
    .zCard(redisKey)
    .pExpire(redisKey, windowMs)
    .exec();

  const count = Number(results?.at(2) ?? 0);
  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);

  return { allowed, remaining, resetMs: windowMs };
};

/**
 * Simple counter-based lockout (for brute-force protection).
 * Increments a counter and returns current count.
 * Counter expires after windowMs.
 */
export const incrementCounter = async (
  key: string,
  windowMs: number
): Promise<number> => {
  const redisKey = `${PREFIX}counter:${key}`;
  const redis = await getRedisClient();
  const count = await redis.incr(redisKey);
  if (count === 1) {
    await redis.pExpire(redisKey, windowMs);
  }
  return count;
};

export const getCounter = async (key: string): Promise<number> => {
  const redisKey = `${PREFIX}counter:${key}`;
  const redis = await getRedisClient();
  const val = await redis.get(redisKey);
  return val ? Number.parseInt(val, 10) : 0;
};

export const resetCounter = async (key: string): Promise<void> => {
  const redisKey = `${PREFIX}counter:${key}`;
  const redis = await getRedisClient();
  await redis.del(redisKey);
};
