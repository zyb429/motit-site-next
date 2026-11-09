// src/components/helpdesk/TicketAttachments.tsx
"use client";

import { useState } from "react";
import {
  Paperclip,
  Download,
  Image as ImageIcon,
  X,
  FileText,
  FileArchive,
  FileSpreadsheet,
  File,
} from "lucide-react";

interface FileRecord {
  id: number;
  uuid: string;
  name: string | null;
  url: string;
  mime: string | null;
  size: number | null;
}

interface Attachment {
  uuid: string;
  files: FileRecord | null;
}

interface Props {
  attachments: Attachment[];
  title?: string;
}

export function TicketAttachments({ attachments, title = "Вложения" }: Props) {
  const [lightbox, setLightbox] = useState<FileRecord | null>(null);

  const files = attachments
    .map((a) => a.files)
    .filter((f): f is FileRecord => f !== null);

  if (files.length === 0) return null;

  const images = files.filter((f) => f.mime?.startsWith("image/"));
  const docs = files.filter((f) => !f.mime?.startsWith("image/"));

  return (
    <>
      <div className="mt-6">
        <h2 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
          <Paperclip size={14} />
          {title} ({files.length})
        </h2>

        {/* Сетка изображений */}
        {images.length > 0 && (
          <div
            className={`grid gap-2 mb-3 ${
              images.length === 1
                ? "grid-cols-1 max-w-sm"
                : images.length === 2
                  ? "grid-cols-2 max-w-md"
                  : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {images.map((f) => (
              <button
                key={f.uuid}
                type="button"
                onClick={() => setLightbox(f)}
                className={`relative group overflow-hidden rounded-xl bg-(--bg-secondary) border border-(--border) hover:border-(--accent)/40 transition-all ${
                  images.length === 1 ? "aspect-video" : "aspect-square"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.url}
                  alt={f.name ?? "Изображение"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ImageIcon
                    size={24}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Список документов */}
        {docs.length > 0 && (
          <ul className="space-y-2">
            {docs.map((f) => (
              <li key={f.uuid}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 rounded-xl bg-(--bg-card) border border-(--border) hover:border-(--accent)/40 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-(--accent-dim) flex items-center justify-center text-(--accent) shrink-0">
                    <FileIcon mime={f.mime} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-(--text-primary) truncate group-hover:text-(--accent) transition-colors">
                      {f.name ?? "Файл"}
                    </div>
                    <div className="text-xs text-(--text-muted) mt-0.5">
                      {formatSize(f.size)}
                      {f.mime ? ` · ${f.mime.split("/")[1]?.toUpperCase()}` : ""}
                    </div>
                  </div>
                  <Download
                    size={16}
                    className="text-(--text-muted) group-hover:text-(--accent) shrink-0 transition-colors"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lightbox для изображений */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt={lightbox.name ?? "Изображение"}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/60 text-white text-sm max-w-[90vw] truncate">
            {lightbox.name ?? "Изображение"}
            {lightbox.size ? ` · ${formatSize(lightbox.size)}` : ""}
          </div>
        </div>
      )}
    </>
  );
}

// Иконка по типу файла
function FileIcon({ mime }: { mime: string | null }) {
  if (!mime) return <Paperclip size={18} />;
  if (mime.includes("pdf")) return <FileText size={18} />;
  if (mime.includes("zip") || mime.includes("compressed"))
    return <FileArchive size={18} />;
  if (mime.includes("word") || mime.includes("document"))
    return <FileText size={18} />;
  if (mime.includes("sheet") || mime.includes("excel"))
    return <FileSpreadsheet size={18} />;
  return <File size={18} />;
}

function formatSize(size: number | null): string {
  if (!size) return "";
  const bytes = Number(size);
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}