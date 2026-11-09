// src/lib/s3.ts
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

/** Снимает обрамляющие кавычки из значения env: '"true"' -> 'true'. */
function envString(name: string, fallback: string): string {
  const raw = process.env[name];
  if (raw == null) return fallback;
  return raw.replace(/^["']|["']$/g, "");
}

function envBool(name: string, fallback: boolean): boolean {
  const raw = envString(name, "");
  if (raw === "") return fallback;
  return raw === "true" || raw === "1";
}

const endpoint = envString("S3_ENDPOINT", "http://localhost:9000");
const region = envString("S3_REGION", "us-east-1");
const accessKeyId = envString("S3_ACCESS_KEY_ID", "minioadmin");
const secretAccessKey = envString("S3_SECRET_ACCESS_KEY", "minioadmin");

/**
 * MinIO / R2 / большинство self-hosted S3 требуют path-style.
 * Для AWS S3 — virtual-hosted (forcePathStyle: false).
 * По умолчанию включаем true, т.к. проект работает с MinIO.
 */
const forcePathStyle = envBool("S3_FORCE_PATH_STYLE", true);

export const s3 = new S3Client({
  region,
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle,
  maxAttempts: 2,
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 3_000,
    requestTimeout: 10_000,
  }),
});

export const S3_BUCKET = envString("S3_BUCKET", "motit-uploads");
export const S3_PUBLIC_URL = envString("S3_PUBLIC_URL", "/files");

export function publicUrl(key: string): string {
  return `${S3_PUBLIC_URL.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
}

/**
 * Гарантирует, что bucket существует. Кеширует результат,
 * чтобы не делать HeadBucket на каждый запрос.
 * При ошибке кеш сбрасывается — попробуем при следующем вызове.
 */
let bucketReady: Promise<void> | null = null;

export function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      try {
        await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
      } catch (err: any) {
        const status = err?.$metadata?.httpStatusCode;
        if (status === 404) {
          try {
            await s3.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
            console.log(`[s3] bucket "${S3_BUCKET}" создан`);
          } catch (createErr: any) {
            // 409 = bucket уже создан кем-то параллельно — это ок
            if (createErr?.$metadata?.httpStatusCode !== 409) {
              throw createErr;
            }
          }
        } else {
          bucketReady = null;
          throw err;
        }
      }
    })();
  }
  return bucketReady;
}

/**
 * Краткая расшифровка ошибки S3 для логов.
 * Возвращает объект, который удобно читать в консоли.
 */
export function describeS3Error(err: any) {
  return {
    name: err?.name,
    message: err?.message,
    code: err?.cause?.code,          // ENOTFOUND / ECONNREFUSED / ETIMEDOUT / ...
    cause: err?.cause,
    httpStatusCode: err?.$metadata?.httpStatusCode,
    attempts: err?.$metadata?.attempts,
    requestId: err?.$metadata?.requestId,
  };
}

export async function uploadToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  await ensureBucket();
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );
  } catch (err) {
    console.error("[s3] PutObject failed:", describeS3Error(err));
    throw err;
  }
  return publicUrl(params.key);
}