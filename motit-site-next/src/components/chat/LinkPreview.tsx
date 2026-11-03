// src/components/chat/LinkPreview.tsx
"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

type OGData = {
  url: string;
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

function firstUrl(text: string): string | null {
  const re =
    /\b(?:https?:\/\/|www\.)[^\s<>"']+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/i;
  const m = text.match(re);
  if (!m) return null;
  const raw = m[0].replace(/[.,!?;:)\]}]+$/, "");
  if (raw.length < 4) return null;
  if (/^\d+\.\d+$/.test(raw)) return null;
  if (!/^https?:\/\//i.test(raw)) return `https://${raw}`;
  return raw;
}

const cache = new Map<string, OGData>();

export function LinkPreview({ text }: { text: string }) {
  const url = firstUrl(text);
  const [data, setData] = useState<OGData | null>(
    url ? (cache.get(url) ?? null) : null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;
    if (cache.has(url)) {
      setData(cache.get(url)!);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        if (!json?.data) return;
        const og: OGData = { url, ...json.data };
        cache.set(url, og);
        setData(og);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!url) return null;

  const domain = getDomain(url);

  if (loading && !data) {
    return (
      <div className="mt-1.5 flex items-center gap-2 p-2 rounded-lg border border-(--border) bg-(--bg-card)/50 text-xs text-(--text-muted)">
        <Loader2 size={12} className="animate-spin" />
        <span>{domain}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1.5 flex items-center gap-2 p-2 rounded-lg border border-(--border) bg-(--bg-card)/50 hover:bg-(--bg-card) transition-colors"
      >
        <div className="w-8 h-8 rounded-md bg-(--bg-secondary) flex items-center justify-center shrink-0">
          <ExternalLink size={14} className="text-(--text-muted)" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-(--text-primary) truncate">
            {domain}
          </div>
          <div className="text-[10px] text-(--text-muted) truncate">{url}</div>
        </div>
      </a>
    );
  }

  const hasImage = !!data.image;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 flex rounded-lg border border-(--border) bg-(--bg-card)/50 hover:bg-(--bg-card) transition-colors overflow-hidden"
    >
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.image}
          alt=""
          className="w-20 h-20 object-cover shrink-0 bg-(--bg-secondary)"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="flex-1 min-w-0 p-2">
        <div className="flex items-center gap-1 text-[10px] text-(--text-muted)">
          {data.favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.favicon}
              alt=""
              className="w-3 h-3 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="uppercase">{data.siteName || domain}</span>
        </div>
        {data.title && (
          <div className="text-xs font-medium text-(--text-primary) line-clamp-2 mt-0.5">
            {data.title}
          </div>
        )}
        {data.description && (
          <div className="text-[11px] text-(--text-muted) line-clamp-2 mt-0.5">
            {data.description}
          </div>
        )}
      </div>
    </a>
  );
}