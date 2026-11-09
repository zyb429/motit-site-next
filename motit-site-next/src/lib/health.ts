// src/lib/health.ts
import { prisma } from "@/lib/prisma";
import { redis, pubsub } from "@/lib/redis";
import { s3, S3_BUCKET, ensureBucket, describeS3Error } from "@/lib/s3";
import { HeadBucketCommand } from "@aws-sdk/client-s3";

export type CheckStatus = "ok" | "fail";
export type CheckResult = {
  status: CheckStatus;
  latencyMs: number;
  detail?: string;
};

/**
 * Таймаут с реальной отменой через AbortController.
 * fn получает signal — его нужно передать в отменяемую операцию
 * (например, s3.send(..., { abortSignal: signal })).
 */
export function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fn(controller.signal)
    .catch((e) => {
      // Приводим AbortError к понятному сообщению
      if (controller.signal.aborted) {
        throw new Error(`${label} timed out after ${ms}ms`);
      }
      throw e;
    })
    .finally(() => clearTimeout(timer));
}

export async function checkDb(): Promise<CheckResult> {
  const start = Date.now();
  try {
    await withTimeout(
      (_signal) => prisma.$queryRaw`SELECT 1`,
      2000,
      "db",
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

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  try {
    await withTimeout(
      (_signal) => redis.ping(),
      1000,
      "redis",
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

export async function checkS3(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // ensureBucket кеширует успех и делает HeadBucket только один раз
    // за всё время жизни процесса. Это сильно быстрее, чем HeadBucket на каждый /api/health.
    await withTimeout((_signal) => ensureBucket(), 2000, "s3");
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (e) {
    console.error("[health] s3 fail:", describeS3Error(e));
    return {
      status: "fail",
      latencyMs: Date.now() - start,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

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