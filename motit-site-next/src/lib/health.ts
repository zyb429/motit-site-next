// src/lib/health.ts
import { prisma } from "@/lib/prisma";
import { redis, pubsub } from "@/lib/redis";
import { s3 } from "@/lib/s3";
import { HeadBucketCommand } from "@aws-sdk/client-s3";

export type CheckStatus = "ok" | "fail";
export type CheckResult = {
  status: CheckStatus;
  latencyMs: number;
  detail?: string;
};

const S3_BUCKET = process.env.S3_BUCKET ?? "motit-uploads";

export function withTimeout<T>(
  fn: () => Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

export async function checkDb(): Promise<CheckResult> {
  const start = Date.now();
  try {
    await withTimeout(() => prisma.$queryRaw`SELECT 1`, 2000, "db");
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (e) {
    return {
      status: "fail",
      latencyMs: Date.now() - start,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  try {
    await withTimeout(() => redis.ping(), 1000, "redis");
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (e) {
    return {
      status: "fail",
      latencyMs: Date.now() - start,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function checkS3(): Promise<CheckResult> {
  const start = Date.now();
  try {
    await withTimeout(
      () => s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET })),
      2000,
      "s3",
    );
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (e) {
    return {
      status: "fail",
      latencyMs: Date.now() - start,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

// Используем ПЕРЕИСПОЛЬЗУЕМЫЙ pubsub-клиент, а не duplicate() на каждый вызов.
export async function checkWsPubSub(): Promise<CheckResult> {
  const start = Date.now();
  const channel = "health:ping";
  const payload = `${Date.now()}-${Math.random()}`;
  try {
    const received = new Promise<void>((resolve, reject) => {
      const onMessage = (ch: string, msg: string) => {
        if (ch === channel && msg === payload) {
          pubsub.off("message", onMessage);
          resolve();
        }
      };
      pubsub.on("message", onMessage);
      setTimeout(() => {
        pubsub.off("message", onMessage);
        reject(new Error("ws pub/sub echo timeout"));
      }, 1500);
    });
    await pubsub.subscribe(channel);
    try {
      await redis.publish(channel, payload);
      await received;
    } finally {
      await pubsub.unsubscribe(channel);
    }
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (e) {
    return {
      status: "fail",
      latencyMs: Date.now() - start,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function checkAll() {
  const [db, redisC, s3C, wsC] = await Promise.all([
    checkDb(),
    checkRedis(),
    checkS3(),
    checkWsPubSub(),
  ]);
  return { db, redis: redisC, s3: s3C, wsPubSub: wsC };
}

// Редактирование detail для неавторизованных
export function redact(
  checks: Record<string, CheckResult>,
  showDetail: boolean,
): Record<string, CheckResult> {
  if (showDetail) return checks;
  return Object.fromEntries(
    Object.entries(checks).map(([k, v]) => [
      k,
      { status: v.status, latencyMs: v.latencyMs },
    ]),
  );
}

export function isAuthorized(req: Request): boolean {
  const expected = process.env.HEALTH_TOKEN;
  if (!expected) return false;
  const got = req.headers.get("authorization");
  return got === `Bearer ${expected}`;
}