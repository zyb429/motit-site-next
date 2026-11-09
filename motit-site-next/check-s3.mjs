// check-s3.mjs
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";

const endpoint = process.argv[2] ?? "http://127.0.0.1:9000";
const bucket = process.argv[3] ?? "motit-uploads";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint,
  credentials: { accessKeyId: "minioadmin", secretAccessKey: "minioadmin" },
  forcePathStyle: true,
});

const t = Date.now();
try {
  await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  console.log(`OK ${Date.now() - t}ms  endpoint=${endpoint} bucket=${bucket}`);
} catch (e) {
  console.error(`FAIL ${Date.now() - t}ms  endpoint=${endpoint} bucket=${bucket}`);
  console.error("  name:", e.name);
  console.error("  status:", e.$metadata?.httpStatusCode);
  console.error("  code:", e.cause?.code);
  console.error("  message:", e.message);
}