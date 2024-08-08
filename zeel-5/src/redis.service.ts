import { createClient, RedisClientType } from 'redis';

export const redisConfig = {
  url: 'redis://localhost:6379',
};
export const redisClient: RedisClientType = createClient(redisConfig);

redisClient.on('error', (err) => console.error('Redis Client Error', err));

redisClient.connect().catch(console.error);

export const get = async (key: any): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch (err) {
    console.error('Error getting data from Redis:', err);
    return null;
  }
};

export const set = async (
  key: any,
  value: any,
  expireTimeInSeconds: number,
): Promise<any> => {
  try {
    await redisClient.set(key, value, { EX: expireTimeInSeconds });
  } catch (err) {
    console.error('Error setting data in Redis:', err);
  }
};
export const del = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error('Error deleting data from Redis:', err);
  }
};
