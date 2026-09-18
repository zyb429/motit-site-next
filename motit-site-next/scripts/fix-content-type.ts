import { HeadObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "../src/lib/prisma";
import { s3, S3_BUCKET, S3_PUBLIC_URL } from "../src/lib/s3";

function guessContentType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

async function main() {
  const files = await prisma.files.findMany({ where: { provider: "s3" } });
  console.log(`Файлов в БД (s3): ${files.length}`);

  const prefix = S3_PUBLIC_URL.replace(/\/+$/, "") + "/";

  let fixed = 0;
  let skipped = 0;
  let failed = 0;

  for (const f of files) {
    if (!f.url || !f.url.startsWith(prefix)) {
      skipped++;
      continue;
    }

    const key = f.url.slice(prefix.length);

    try {
      const head = await s3.send(
        new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }),
      );

      const currentCT = head.ContentType ?? "";

      if (currentCT.startsWith("image/")) {
        skipped++;
        continue;
      }

      const contentType = guessContentType(key);

      await s3.send(
        new CopyObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          CopySource: `${S3_BUCKET}/${encodeURIComponent(key)}`,
          ContentType: contentType,
          MetadataDirective: "REPLACE",
        }),
      );

      console.log(`✅ ${key}  ${currentCT || "?"} → ${contentType}`);
      fixed++;
    } catch (err) {
      console.error(`❌ ${key}:`, (err as Error).message);
      failed++;
    }
  }

  console.log(
    `\nГотово. Исправлено: ${fixed}, пропущено: ${skipped}, ошибок: ${failed}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
