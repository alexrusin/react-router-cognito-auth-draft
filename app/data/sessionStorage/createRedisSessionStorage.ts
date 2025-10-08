import {
  createSessionStorage,
  type Cookie,
  type CookieOptions,
} from "react-router";
import { createClient, type RedisClientType } from "redis";

interface RedisSessionStorageOptions {
  cookie: Cookie;
  cookieOptions: CookieOptions;
  host?: string;
  port?: number;
  password?: string;
  prefix?: string;
  database?: number;
}

export function createRedisSessionStorage({
  cookie,
  host = "127.0.0.1",
  port = 6379,
  password,
  prefix = "session:",
  database = 0,
}: RedisSessionStorageOptions) {
  const client: RedisClientType = createClient({
    socket: { host, port },
    password,
    database,
  });

  client.connect().catch((err) => {
    console.error("Redis connection error:", err);
  });

  return createSessionStorage({
    cookie,

    async createData<Data extends Record<string, any>>(
      data: Data,
      expires?: Date,
    ): Promise<string> {
      const id = crypto.randomUUID();
      const key = `${prefix}${id}`;
      const ttl = getTTL(cookie, expires);

      const value = JSON.stringify(data);

      if (ttl > 0) {
        await client.setEx(key, ttl, value);
      } else {
        await client.set(key, value);
      }

      return id;
    },

    async readData<Data = any>(id: string): Promise<Data | null> {
      const key = `${prefix}${id}`;
      const value = await client.get(key);
      return value ? (JSON.parse(value) as Data) : null;
    },

    async updateData<Data extends Record<string, any>>(
      id: string,
      data: Data,
      expires?: Date,
    ): Promise<void> {
      const key = `${prefix}${id}`;
      const ttl = getTTL(cookie, expires);
      const value = JSON.stringify(data);

      if (ttl > 0) {
        await client.setEx(key, ttl, value);
      } else {
        await client.set(key, value);
      }
    },

    async deleteData(id: string): Promise<void> {
      const key = `${prefix}${id}`;
      await client.del(key);
    },
  });
}

/**
 * Helper: determine Redis TTL (in seconds)
 * Uses cookie.maxAge (seconds) if available, otherwise falls back to expires date.
 */
function getTTL(cookieOptions?: CookieOptions, expires?: Date): number {
  if (cookieOptions?.maxAge && typeof cookieOptions.maxAge === "number") {
    return Math.max(1, Math.floor(cookieOptions.maxAge));
  }

  if (expires instanceof Date) {
    return Math.max(1, Math.floor((expires.getTime() - Date.now()) / 1000));
  }

  return 0;
}
