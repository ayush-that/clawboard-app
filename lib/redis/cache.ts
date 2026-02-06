import { getRedisClient } from "./client";

const PREFIX = "clawboard:cache:";

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const redis = await getRedisClient();
  const raw = await redis.get(`${PREFIX}${key}`);
  if (raw === null) {
    return null;
  }
  return JSON.parse(raw) as T;
};

export const cacheSet = async <T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> => {
  const redis = await getRedisClient();
  await redis.set(`${PREFIX}${key}`, JSON.stringify(value), {
    EX: ttlSeconds,
  });
};

export const cacheDel = async (key: string): Promise<void> => {
  const redis = await getRedisClient();
  await redis.del(`${PREFIX}${key}`);
};
