import { PutObjectCommand } from "@aws-sdk/client-s3";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { prisma } from "../src/lib/prisma";
import { s3, S3_BUCKET, publicUrl } from "../src/lib/s3";

const UPLOADS_DIR = "../motit-backend/public/uploads";

async function main() {
  if (!existsSync(UPLOADS_DIR)) {
    console.error(`❌ Не найдена папка ${UPLOADS_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(UPLOADS_DIR).filter((f) => {
    if (f === ".gitkeep") return false;
    return statSync(join(UPLOADS_DIR, f)).isFile();
  });

  console.log(`Найдено файлов: ${files.length}`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const fileName of files) {
    const filePath = join(UPLOADS_DIR, fileName);

    // Ищем запись в БД по окончанию URL
    const existing = await prisma.files.findFirst({
      where: {
        OR: [
          { url: { endsWith: fileName } },
          { url: { endsWith: fileName.replace(/\.[^.]+$/, "") } },
        ],
      },
    });

    if (!existing) {
      skipped++;
      continue;
    }

    if (existing.provider === "s3" && existing.url?.startsWith("http")) {
      skipped++;
      continue;
    }

    const key = `uploads/${fileName}`;

    try {
      const buffer = readFileSync(filePath);
      const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
      const contentType =
        ext === "png" ? "image/png"
        : ext === "jpg" || ext === "jpeg" ? "image/jpeg"
        : ext === "webp" ? "image/webp"
        : ext === "gif" ? "image/gif"
        : "application/octet-stream";

      await s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ContentLength: buffer.length,
        }),
      );

      const url = publicUrl(key);

      await prisma.files.update({
        where: { id: existing.id },
        data: { url, provider: "s3", updated_at: new Date() },
      });

      console.log(`✅ ${fileName} → ${url}`);
      migrated++;
    } catch (err) {
      console.error(`❌ Ошибка при ${fileName}:`, (err as Error).message);
      failed++;
    }
  }

  console.log(
    `\nГотово. Перенесено: ${migrated}, пропущено: ${skipped}, ошибок: ${failed}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
