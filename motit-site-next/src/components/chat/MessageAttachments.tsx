// src/components/chat/MessageAttachments.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, Download, ExternalLink, X } from "lucide-react";
import type { ChatMessageItem } from "@/lib/db/chat";
import type { PreviewFile } from "./MediaPreviewModal";

type Attachment = ChatMessageItem["attachments"][number];

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function isImage(mime: string | null) {
  return !!mime && mime.startsWith("image/");
}

function toPreviewFile(a: Attachment): PreviewFile {
  return {
    id: a.file.id,
    uuid: a.file.uuid,
    name: a.file.name,
    url: a.file.url,
    mime: a.file.mime,
    size: a.file.size,
  };
}

export function MessageAttachments({
  attachments,
  onPreviewFileAction,
}: {
  attachments: Attachment[];
  onPreviewFileAction?: (
    file: PreviewFile,
    allFiles: PreviewFile[],
  ) => void;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter((a) => isImage(a.file.mime));
  const files = attachments.filter((a) => !isImage(a.file.mime));

  const previewFiles: PreviewFile[] = images.map(toPreviewFile);

  const openImage = (index: number) => {
    if (onPreviewFileAction) {
      onPreviewFileAction(previewFiles[index], previewFiles);
      return;
    }
    setLightbox(index);
  };

  const maxVisible = 4;
  const visibleImages = images.slice(0, maxVisible);
  const hiddenCount = images.length - maxVisible;

  return (
    <div className="mt-1.5 space-y-2">
      {images.length > 0 && (
        <div
          className={`grid gap-1 overflow-hidden rounded-xl ${
            images.length === 1
              ? "grid-cols-1 max-w-[340px]"
              : "grid-cols-2 max-w-[420px]"
          }`}
        >
          {visibleImages.map((img, idx) => (
            <button
              key={img.uuid}
              type="button"
              onClick={() => openImage(idx)}
              className={`group relative overflow-hidden bg-(--bg-primary) cursor-zoom-in rounded-lg ${
                images.length === 1
                  ? "max-h-[320px] aspect-auto"
                  : "aspect-square"
              } ${images.length === 3 && idx === 0 ? "col-span-2" : ""}`}
            >
              <Image
                src={img.file.url}
                alt={img.file.name}
                fill
                sizes="(max-width: 768px) 100vw, 340px"
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <span className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={12} />
              </span>
            </button>
          ))}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => openImage(maxVisible)}
              className="aspect-square flex flex-col items-center justify-center bg-(--bg-secondary) text-(--text-primary) font-semibold hover:bg-(--bg-primary) transition-colors rounded-lg"
            >
              <span className="text-xl">+{hiddenCount}</span>
              <span className="text-[10px] text-(--text-muted)">ещё</span>
            </button>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((f) => (
            <a
              key={f.uuid}
              href={f.file.url}
              target="_blank"
              rel="noopener noreferrer"
              download={f.file.name}
              className="flex items-center gap-2 p-2 rounded-lg bg-(--bg-secondary) border border-(--border) hover:border-(--accent) transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-(--accent-dim) flex items-center justify-center shrink-0">
                <FileText size={16} className="text-(--accent)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-(--text-primary) truncate">
                  {f.file.name}
                </p>
                <p className="text-[10px] text-(--text-muted)">
                  {formatSize(f.file.size)}
                </p>
              </div>
              <Download
                size={14}
                className="shrink-0 text-(--text-muted) group-hover:text-(--accent) transition-colors"
              />
            </a>
          ))}
        </div>
      )}

      {lightbox !== null && images[lightbox] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightbox].file.url}
            alt={images[lightbox].file.name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}