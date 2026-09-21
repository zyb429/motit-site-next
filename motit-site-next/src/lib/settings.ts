// src/lib/settings.ts
import { prisma } from "@/lib/prisma";

const ALLOWED_MIME_KEY = "upload.allowed_mime";

export const ALL_MIME_OPTIONS: { group: string; mime: string; label: string }[] = [
  { group: "Изображения", mime: "image/png", label: "PNG" },
  { group: "Изображения", mime: "image/jpeg", label: "JPEG" },
  { group: "Изображения", mime: "image/gif", label: "GIF" },
  { group: "Изображения", mime: "image/webp", label: "WebP" },
  { group: "Изображения", mime: "image/svg+xml", label: "SVG" },
  { group: "Изображения", mime: "image/bmp", label: "BMP" },

  { group: "Текст и код", mime: "text/plain", label: "TXT" },
  { group: "Текст и код", mime: "text/markdown", label: "Markdown" },
  { group: "Текст и код", mime: "text/csv", label: "CSV" },
  { group: "Текст и код", mime: "text/html", label: "HTML" },
  { group: "Текст и код", mime: "text/css", label: "CSS" },
  { group: "Текст и код", mime: "application/json", label: "JSON" },
  { group: "Текст и код", mime: "application/xml", label: "XML" },
  { group: "Текст и код", mime: "application/x-yaml", label: "YAML" },
  { group: "Текст и код", mime: "application/javascript", label: "JavaScript" },
  { group: "Текст и код", mime: "application/typescript", label: "TypeScript" },

  { group: "Документы", mime: "application/pdf", label: "PDF" },
  { group: "Документы", mime: "application/msword", label: "DOC" },
  {
    group: "Документы",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "DOCX",
  },
  { group: "Документы", mime: "application/vnd.ms-excel", label: "XLS" },
  {
    group: "Документы",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    label: "XLSX",
  },
  { group: "Документы", mime: "application/vnd.ms-powerpoint", label: "PPT" },
  {
    group: "Документы",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    label: "PPTX",
  },

  { group: "Архивы", mime: "application/zip", label: "ZIP" },
  { group: "Архивы", mime: "application/x-rar-compressed", label: "RAR" },
  { group: "Архивы", mime: "application/gzip", label: "GZ" },
  { group: "Архивы", mime: "application/x-7z-compressed", label: "7Z" },
];

export const DEFAULT_ALLOWED_MIME: string[] = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
];

export async function getAllowedMime(): Promise<string[]> {
  const row = await prisma.settings.findUnique({
    where: { key: ALLOWED_MIME_KEY },
  });

  if (!row?.value) return DEFAULT_ALLOWED_MIME;

  try {
    const parsed = JSON.parse(row.value);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_ALLOWED_MIME;
}

export async function setAllowedMime(mimeList: string[]): Promise<void> {
  const value = JSON.stringify(mimeList);
  await prisma.settings.upsert({
    where: { key: ALLOWED_MIME_KEY },
    update: { value, updated_at: new Date() },
    create: {
      key: ALLOWED_MIME_KEY,
      value,
      description: "Разрешённые MIME-типы для загрузки файлов",
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
}
