// src/components/helpdesk/TicketAttachments.tsx
"use client";

import { useState } from "react";
import {
  Paperclip,
  Download,
  Image as ImageIcon,
  FileText,
  FileArchive,
  FileSpreadsheet,
  File as FileIcon,
  Play,
  Music,
} from "lucide-react";
import {
  MediaPreviewModal,
  type PreviewFile,
} from "@/components/chat/MediaPreviewModal";

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
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [previewIndex, setPreviewIndex] = useState(-1);

  const files = attachments
    .map((attachment) => attachment.files)
    .filter((file): file is FileRecord => file !== null);

  const images = files.filter((file) => file.mime?.startsWith("image/"));

  const otherFiles = files.filter((file) => !file.mime?.startsWith("image/"));

  // Порядок переключения совпадает с порядком отображения:
  // сначала изображения, затем остальные вложения.
  const orderedFiles = [...images, ...otherFiles];

  function openPreview(file: FileRecord) {
    const mappedFiles: PreviewFile[] = orderedFiles.map((item) => ({
      id: item.id,
      uuid: item.uuid,
      name: item.name || "Файл",
      url: item.url,
      mime: item.mime,
      size: item.size,
      kind: "attachment",
    }));

    const index = mappedFiles.findIndex((item) => item.uuid === file.uuid);

    if (index < 0) return;

    setPreviewFiles(mappedFiles);
    setPreviewIndex(index);
  }

  function closePreview() {
    setPreviewIndex(-1);
    setPreviewFiles([]);
  }

  function navigatePreview(index: number) {
    if (index < 0 || index >= previewFiles.length) return;
    setPreviewIndex(index);
  }

  if (files.length === 0) return null;

  const activeFile = previewFiles[previewIndex];

  return (
    <>
      <section className="mt-6 min-w-0">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
          <Paperclip size={14} className="shrink-0" />
          {title} ({files.length})
        </h2>

        {/* Изображения */}
        {images.length > 0 && (
          <ul
            className={`mb-3 grid gap-2 ${
              images.length === 1
                ? "max-w-sm grid-cols-1"
                : images.length === 2
                  ? "max-w-md grid-cols-2"
                  : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {images.map((file) => (
              <li key={file.uuid} className="min-w-0">
                <button
                  type="button"
                  onClick={() => openPreview(file)}
                  aria-label={`Открыть ${file.name || "изображение"}`}
                  className={`group relative block w-full overflow-hidden rounded-xl border border-(--border) bg-(--bg-secondary) transition-colors hover:border-(--accent)/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) ${
                    images.length === 1 ? "aspect-video" : "aspect-square"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.url}
                    alt={file.name || "Изображение"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                    <ImageIcon
                      size={24}
                      className="text-white opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    />
                  </span>

                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6 text-left">
                    <span className="block truncate text-xs font-medium text-white">
                      {file.name || "Изображение"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Видео, аудио и документы */}
        {otherFiles.length > 0 && (
          <ul className="space-y-2">
            {otherFiles.map((file) => (
              <li
                key={file.uuid}
                className="flex min-w-0 items-center gap-1 rounded-xl border border-(--border) bg-(--bg-card) transition-colors hover:border-(--accent)/40"
              >
                <button
                  type="button"
                  onClick={() => openPreview(file)}
                  aria-label={`Открыть ${file.name || "файл"}`}
                  className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--accent-dim) text-(--accent)">
                    <AttachmentIcon mime={file.mime} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-(--text-primary) transition-colors group-hover:text-(--accent)">
                      {file.name || "Файл"}
                    </span>

                    <span className="mt-0.5 block truncate text-xs text-(--text-muted)">
                      {getFileDescription(file)}
                    </span>
                  </span>
                </button>

                <a
                  href={file.url}
                  download={file.name || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Скачать ${file.name || "файл"}`}
                  title="Скачать файл"
                  className="mr-2 shrink-0 rounded-lg p-2 text-(--text-muted) transition-colors hover:bg-(--bg-secondary) hover:text-(--accent)"
                >
                  <Download size={16} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {previewIndex >= 0 && activeFile && (
        <MediaPreviewModal
          file={activeFile}
          siblings={previewFiles}
          currentIndex={previewIndex}
          onCloseAction={closePreview}
          onNavigateAction={navigatePreview}
        />
      )}
    </>
  );
}

function AttachmentIcon({ mime }: { mime: string | null }) {
  if (!mime) return <Paperclip size={18} />;

  if (mime.startsWith("video/")) {
    return <Play size={18} fill="currentColor" />;
  }

  if (mime.startsWith("audio/")) {
    return <Music size={18} />;
  }

  if (
    mime.includes("zip") ||
    mime.includes("compressed") ||
    mime.includes("gzip") ||
    mime.includes("tar")
  ) {
    return <FileArchive size={18} />;
  }

  if (mime.includes("sheet") || mime.includes("excel")) {
    return <FileSpreadsheet size={18} />;
  }

  if (
    mime.includes("pdf") ||
    mime.includes("word") ||
    mime.includes("document") ||
    mime.startsWith("text/")
  ) {
    return <FileText size={18} />;
  }

  return <FileIcon size={18} />;
}

function getFileDescription(file: FileRecord): string {
  const mime = file.mime?.toLowerCase();

  const type = !mime
    ? "Файл"
    : mime.startsWith("video/")
      ? "Видео"
      : mime.startsWith("audio/")
        ? "Аудио"
        : mime === "application/pdf"
          ? "PDF"
          : mime.split("/")[1]?.toUpperCase() || "Файл";

  return [formatSize(file.size), type].filter(Boolean).join(" · ");
}

function formatSize(size: number | null): string {
  if (size === null || !Number.isFinite(size) || size < 0) {
    return "";
  }

  if (size < 1024) return `${size} Б`;
  if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} КБ`;
  if (size < 1024 ** 3) return `${(size / 1024 ** 2).toFixed(1)} МБ`;

  return `${(size / 1024 ** 3).toFixed(1)} ГБ`;
}
