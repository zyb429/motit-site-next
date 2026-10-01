// src/components/chat/MediaPreviewModal.tsx
"use client";

import { useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
} from "lucide-react";

export type PreviewFile = {
  id: number;
  uuid: string;
  name: string;
  url: string;
  mime: string | null;
  size: number | null;
};

export function MediaPreviewModal({
  file,
  siblings,
  currentIndex,
  onCloseAction,
  onNavigateAction,
}: {
  file: PreviewFile;
  siblings: PreviewFile[];
  currentIndex: number;
  onCloseAction: () => void;
  onNavigateAction: (index: number) => void;
}) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < siblings.length - 1;

  // Закрытие по Escape + стрелки
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseAction();
      if (e.key === "ArrowLeft" && hasPrev) onNavigateAction(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigateAction(currentIndex + 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [currentIndex, hasPrev, hasNext, onCloseAction, onNavigateAction]);

  // Блокируем скролл body, пока открыта модалка
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const mime = file.mime ?? "";
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  const isAudio = mime.startsWith("audio/");
  const isPdf = mime === "application/pdf";

  return (
    <div
      className="fixed inset-0 z-100 bg-black/90 flex flex-col"
      onClick={onCloseAction}
    >
      {/* Хедер: имя + действия + закрыть */}
      <div
        className="shrink-0 flex items-center justify-between gap-3 p-3 border-b border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-medium truncate">
            {file.name}
          </div>
          {file.size != null && (
            <div className="text-white/60 text-xs">
              {(file.size / 1024).toFixed(1)} КБ
              {file.mime ? ` · ${file.mime}` : ""}
            </div>
          )}
        </div>

        <a
          href={file.url}
          download={file.name}
          className="shrink-0 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title="Скачать"
        >
          <Download size={18} />
        </a>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title="Открыть в новой вкладке"
        >
          <ExternalLink size={18} />
        </a>
        <button
          type="button"
          onClick={onCloseAction}
          className="shrink-0 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>
      </div>

      {/* Область просмотра */}
      <div
        className="flex-1 min-h-0 relative flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {isVideo && (
          <video
            key={file.uuid}
            src={file.url}
            controls
            playsInline
            preload="metadata"
            className="max-w-full max-h-full"
          >
            Ваш браузер не поддерживает видео.
          </video>
        )}

        {isAudio && (
          <audio src={file.url} controls className="w-full max-w-md">
            Ваш браузер не поддерживает аудио.
          </audio>
        )}

        {isPdf && (
          <iframe
            src={file.url}
            title={file.name}
            className="w-full h-full rounded-lg bg-white"
          />
        )}

        {!isImage && !isVideo && !isAudio && !isPdf && (
          <div className="text-center text-white/80 max-w-sm">
            <p className="text-lg font-medium mb-2">
              Предпросмотр недоступен
            </p>
            <p className="text-sm text-white/60 mb-4">
              Файл типа {file.mime || "неизвестный"} нельзя показать в браузере.
            </p>
            <a
              href={file.url}
              download={file.name}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              <Download size={16} />
              Скачать файл
            </a>
          </div>
        )}

        {/* Навигация prev/next */}
        {hasPrev && (
          <button
            type="button"
            onClick={() => onNavigateAction(currentIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Предыдущий"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {hasNext && (
          <button
            type="button"
            onClick={() => onNavigateAction(currentIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Следующий"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Счётчик */}
      {siblings.length > 1 && (
        <div className="shrink-0 text-center text-white/60 text-xs py-2">
          {currentIndex + 1} / {siblings.length}
        </div>
      )}
    </div>
  );
}
