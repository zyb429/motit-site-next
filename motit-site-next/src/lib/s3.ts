import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT || "http://localhost:9000";
const region = process.env.S3_REGION || "us-east-1";
const accessKeyId = process.env.S3_ACCESS_KEY_ID || "minioadmin";
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "minioadmin";

export const s3 = new S3Client({
  region,
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
});

export const S3_BUCKET = process.env.S3_BUCKET || "motit-uploads";
export const S3_PUBLIC_URL =
  process.env.S3_PUBLIC_URL || "http://localhost:9000/motit-uploads";

export function publicUrl(key: string): string {
  return `${S3_PUBLIC_URL.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
}
