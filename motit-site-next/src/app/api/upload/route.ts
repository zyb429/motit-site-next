// src/app/api/upload/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { uploadToS3, describeS3Error } from "@/lib/s3";
import { getAllowedMime } from "@/lib/settings";

const MAX_SIZE = 50 * 1024 * 1024; // 20 МБ на файл

// Если браузер не отдал MIME, определяем по расширению
const EXT_MIME_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",

  txt: "text/plain",
  md: "text/markdown",
  markdown: "text/markdown",
  csv: "text/csv",
  log: "text/plain",
  html: "text/html",
  css: "text/css",
  xml: "application/xml",
  yaml: "application/x-yaml",
  yml: "application/x-yaml",
  json: "application/json",
  js: "application/javascript",
  mjs: "application/javascript",
  cjs: "application/javascript",
  ts: "application/typescript",
  tsx: "application/typescript",

  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  zip: "application/zip",
  rar: "application/x-rar-compressed",
  gz: "application/gzip",
  "7z": "application/x-7z-compressed",

  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  m4v: "video/x-m4v",
  ogv: "video/ogg",

  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  aac: "audio/aac",
};

function resolveMime(file: File): string {
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MIME_MAP[ext] ?? "application/octet-stream";
}

/**
 * Разрешённые символы для папки: буквы, цифры, дефис, подчёркивание, слэш.
 * Защита от path traversal (`..`, `//`, абсолютные пути).
 */
function sanitizeFolder(raw: string | null): string {
  if (!raw) return "";
  return raw
    .trim()
    .replace(/^\/+|\/+$/g, "")        // убрать ведущие/хвостовые слэши
    .replace(/[^a-zA-Z0-9/_-]/g, "") // только безопасные символы
    .replace(/\/+/g, "/")             // убрать двойные слэши
    .replace(/\.\./g, "");            // убрать ".."
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Настройки берём из БД (админ редактирует через /admin/settings/upload)
    const allowedMime = new Set(await getAllowedMime());

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "Файлы не найдены" }, { status: 400 });
    }
    if (files.length > 5) {
      return NextResponse.json(
        { error: "Не больше 5 файлов за раз" },
        { status: 400 },
      );
    }

    // Папка из формы (Puck-поля сертификатов/политики шлют "certificates" / "policies")
    const folder = sanitizeFolder(formData.get("folder") as string | null);

    const created: {
      id: number;
      documentId: string | null;
      name: string;
      url: string;
      mime: string | null;
      size: number | null;
    }[] = [];

    for (const file of files) {
      const mime = resolveMime(file);

      if (!allowedMime.has(mime)) {
        return NextResponse.json(
          { error: `Недопустимый тип файла: ${file.name} (${mime})` },
          { status: 400 },
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `Файл ${file.name} больше 20 МБ` },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";

      // Если folder задан — кладём в него, иначе в uploads/
      const key = folder
        ? `${folder}/${randomUUID()}.${ext}`
        : `uploads/${randomUUID()}.${ext}`;

      // uploadToS3 делает ensureBucket() + логирование причины ошибки
      const url = await uploadToS3({ key, body: buffer, contentType: mime });

      const record = await prisma.files.create({
        data: {
          document_id: randomUUID(),
          name: file.name,
          mime,
          size: file.size,
          url,
          provider: "s3",
          folder_path: folder || null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      created.push({
        id: record.id,
        documentId: record.document_id ?? null,
        name: record.name ?? "",
        url,
        mime: record.mime ?? null,
        size: record.size ?? null,
      });
    }

    return NextResponse.json(created);
  } catch (error: any) {
    // Разворачиваем причину S3, если она есть, — иначе глухое ECONNRESET
    const s3Info = error?.$metadata ? describeS3Error(error) : undefined;
    console.error("[api/upload] error:", {
      name: error?.name,
      message: error?.message,
      code: error?.cause?.code,
      s3: s3Info,
    });
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
