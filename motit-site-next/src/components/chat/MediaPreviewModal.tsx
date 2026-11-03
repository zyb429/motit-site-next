// src/components/chat/MediaPreviewModal.tsx
"use client";

import { useEffect, useState } from "react";
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
  /** "attachment" (по умолчанию) — файл; "link" — гиперссылка с OG-превью */
  kind?: "attachment" | "link";
  /** Для kind === "link": URL, куда ведёт ссылка (может отличаться от url) */
  href?: string;
};

type FileKind = "image" | "video" | "audio" | "pdf" | "text" | "link" | "other";

function detectKind(file: PreviewFile): FileKind {
  if (file.kind === "link") return "link";

  const mime = (file.mime ?? "").toLowerCase();
  const name = (file.name ?? "").toLowerCase();

  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("text/")) return "text";

  if (/\.(png|jpe?g|gif|webp|svg|bmp|avif|ico)$/.test(name)) return "image";
  if (/\.(mp4|webm|mov|mkv|ogv|avi)$/.test(name)) return "video";
  if (/\.(mp3|wav|ogg|oga|m4a|aac|flac|opus)$/.test(name)) return "audio";
  if (/\.pdf$/.test(name)) return "pdf";
  if (/\.(txt|md|markdown|json|xml|csv|log|yaml|yml|html?|css|js|ts|tsx|jsx)$/.test(name)) return "text";

  return "other";
}

// Мини-OG-превью для ссылок (загружается с /api/link-preview)
type OGData = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
};

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function LinkPreviewBlock({ url }: { url: string }) {
  const [data, setData] = useState<OGData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.data) return;
        setData(json.data);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [url]);

  const domain = getDomain(url);

  if (loading && !data) {
    return (
      <div className="w-full max-w-md p-4 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm">
        Загрузка превью {domain}…
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full max-w-md rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition-colors flex flex-col"
    >
      {data?.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.image}
          alt=""
          className="w-full h-48 object-cover"
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-white/50 mb-1">
          {data?.favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.favicon} alt="" className="w-3.5 h-3.5 rounded-sm" />
          )}
          <span className="uppercase">{data?.siteName || domain}</span>
        </div>
        {data?.title && (
          <div className="text-white text-sm font-medium line-clamp-2">
            {data.title}
          </div>
        )}
        {data?.description && (
          <div className="text-white/60 text-xs mt-1 line-clamp-2">
            {data.description}
          </div>
        )}
        {!data?.title && !data?.description && (
          <div className="text-white text-sm truncate">{url}</div>
        )}
      </div>
    </a>
  );
}

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseAction();
      if (e.key === "ArrowLeft" && hasPrev) onNavigateAction(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigateAction(currentIndex + 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [currentIndex, hasPrev, hasNext, onCloseAction, onNavigateAction]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const kind = detectKind(file);

  // Для kind === "link" URL, куда ведёт ссылка — href ?? url
  const linkUrl = file.href ?? file.url;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex flex-col"
      onClick={onCloseAction}
    >
      {/* Хедер */}
      <div
        className="shrink-0 flex items-center justify-between gap-3 p-3 border-b border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-medium truncate">
            {file.name}
          </div>
          {file.size != null && kind !== "link" && (
            <div className="text-white/60 text-xs">
              {(file.size / 1024).toFixed(1)} КБ
              {file.mime ? ` · ${file.mime}` : ""}
            </div>
          )}
        </div>

        {kind !== "link" && (
          <a
            href={file.url}
            download={file.name}
            className="shrink-0 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Скачать"
          >
            <Download size={18} />
          </a>
        )}
        <a
          href={kind === "link" ? linkUrl : file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title={kind === "link" ? "Открыть ссылку" : "Открыть в новой вкладке"}
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
        {kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {kind === "video" && (
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

        {kind === "audio" && (
          <div className="w-full max-w-md flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-3xl text-white/60">♪</span>
            </div>
            <div className="text-white text-sm text-center">{file.name}</div>
            <audio src={file.url} controls className="w-full">
              Ваш браузер не поддерживает аудио.
            </audio>
          </div>
        )}

        {kind === "pdf" && (
          <iframe
            src={file.url}
            title={file.name}
            className="w-full h-full rounded-lg bg-white"
          />
        )}

        {kind === "text" && (
          <iframe
            src={file.url}
            title={file.name}
            className="w-full h-full rounded-lg bg-white"
          />
        )}

        {kind === "link" && <LinkPreviewBlock url={linkUrl} />}

        {kind === "other" && (
          <div className="text-center text-white/80 max-w-sm">
            <p className="text-lg font-medium mb-2">Предпросмотр недоступен</p>
            <p className="text-sm text-white/60 mb-4">
              Файл типа{" "}
              {file.mime || file.name.split(".").pop() || "неизвестный"} нельзя
              показать в браузере.
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