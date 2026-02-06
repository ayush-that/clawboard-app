import { createClient } from "redis";

export type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | null = null;

export const getRedisClient = async (): Promise<RedisClient> => {
  if (client?.isOpen) {
    return client;
  }

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is not set");
  }

  client = createClient({ url });

  client.on("error", (err) => {
    console.error("[Redis] connection error:", err);
  });

  await client.connect();
  return client;
};
