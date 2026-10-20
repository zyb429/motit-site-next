// src/lib/redis.ts
import Redis from "ioredis";

const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
  pubsub?: Redis;
};

export const redis =
  globalForRedis.redis ??
  new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });

// Отдельный клиент для subscribe. ioredis переводит клиент в subscriber-режим,
// и обычные команды (get/set/publish) на нём перестают работать.
export const pubsub =
  globalForRedis.pubsub ??
  new Redis(url, {
    maxRetriesPerRequest: null,
    lazyConnect: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
  globalForRedis.pubsub = pubsub;
}