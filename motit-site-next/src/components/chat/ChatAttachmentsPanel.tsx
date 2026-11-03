// src/components/chat/ChatAttachmentsPanel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  FileText,
  ImageIcon,
  Film,
  Music,
  FileArchive,
  Download,
  ExternalLink,
  LayoutGrid,
  MessageSquare,
  Copy,
} from "lucide-react";
import type { ChatMessageItem } from "@/lib/db/chat";
import type { PreviewFile } from "./MediaPreviewModal";

type Tab = "all" | "media" | "files" | "voice" | "links";

type Att = ChatMessageItem["attachments"][number];

type Row = {
  date: Date;
  att: Att;
  message: ChatMessageItem;
};

type LinkRow = {
  date: Date;
  url: string;
  message: ChatMessageItem;
};

type CtxMenu =
  | { kind: "attachment"; x: number; y: number; row: Row }
  | { kind: "link"; x: number; y: number; row: LinkRow }
  | null;

const URL_REGEX =
  /\b(?:https?:\/\/|www\.)[^\s<>"']+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/gi;

function hrefFor(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (/^www\./i.test(url)) return `https://${url}`;
  return `https://${url}`;
}

function classify(
  mime: string | null,
): "image" | "video" | "audio" | "doc" | "other" {
  if (!mime) return "other";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf" || mime.startsWith("application/")) {
    return "doc";
  }
  return "other";
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function toPreviewFile(a: Att): PreviewFile {
  return {
    id: a.file.id,
    uuid: a.file.uuid,
    name: a.file.name,
    url: a.file.url,
    mime: a.file.mime,
    size: a.file.size,
  };
}

function groupByDate<T extends { date: Date }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const it of items) {
    const key = it.date.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
}

function dateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (iso === today.toISOString().slice(0, 10)) return "Сегодня";
  if (iso === yesterday.toISOString().slice(0, 10)) return "Вчера";
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ChatAttachmentsPanel({
  messages,
  onCloseAction,
  onPreviewFileAction,
  onJumpToMessageAction,
}: {
  messages: ChatMessageItem[];
  onCloseAction: () => void;
  onPreviewFileAction?: (file: PreviewFile, allFiles: PreviewFile[]) => void;
  onJumpToMessageAction?: (messageUuid: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [ctxMenu, setCtxMenu] = useState<CtxMenu>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctxMenu) return;

    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setCtxMenu(null);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setCtxMenu(null);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ctxMenu]);

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>(
      `[data-tab="${tab}"]`,
    );
    if (active) {
      const c = container.getBoundingClientRect();
      const a = active.getBoundingClientRect();
      if (a.left < c.left || a.right > c.right) {
        active.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [tab]);

  const allAttachments: Row[] = useMemo(() => {
    const rows: Row[] = [];
    for (const m of messages) {
      if (m.deleted_at) continue;
      if (!m.created_at) continue;
      if (!m.attachments || m.attachments.length === 0) continue;

      const d =
        typeof m.created_at === "string"
          ? new Date(m.created_at)
          : m.created_at;

      for (const a of m.attachments) {
        rows.push({ date: d, att: a, message: m });
      }
    }
    return rows;
  }, [messages]);

  const linkRows: LinkRow[] = useMemo(() => {
    const rows: LinkRow[] = [];
    for (const m of messages) {
      if (m.deleted_at) continue;
      if (!m.created_at) continue;
      if (!m.content) continue;

      const d =
        typeof m.created_at === "string"
          ? new Date(m.created_at)
          : m.created_at;

      const seen = new Set<string>();
      for (const match of m.content.matchAll(URL_REGEX)) {
        const raw = match[0].replace(/[.,!?;:)\]}]+$/, "");
        if (raw.length < 4) continue;
        if (/^\d+\.\d+$/.test(raw)) continue;
        if (seen.has(raw)) continue;
        seen.add(raw);
        rows.push({ date: d, url: raw, message: m });
      }
    }
    return rows.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [messages]);

  const counts = useMemo(() => {
    let media = 0;
    let files = 0;
    let voice = 0;
    for (const { att } of allAttachments) {
      const kind = classify(att.file.mime);
      if (kind === "image" || kind === "video") media++;
      else if (kind === "doc" || kind === "other") files++;
      else if (kind === "audio") voice++;
    }
    return {
      all: allAttachments.length,
      media,
      files,
      voice,
      links: linkRows.length,
    };
  }, [allAttachments, linkRows.length]);

  // «Все» = вложения + ссылки. Остальные — только вложения.
  const filteredAttachments = useMemo(() => {
    if (tab === "all") return allAttachments;
    if (tab === "links") return [];
    return allAttachments.filter(({ att }) => {
      const kind = classify(att.file.mime);
      if (tab === "media") return kind === "image" || kind === "video";
      if (tab === "files") return kind === "doc" || kind === "other";
      if (tab === "voice") return kind === "audio";
      return false;
    });
  }, [allAttachments, tab]);

  const groupedAttachments = useMemo(
    () => groupByDate(filteredAttachments),
    [filteredAttachments],
  );

  const groupedLinks = useMemo(
    () => (tab === "links" || tab === "all" ? groupByDate(linkRows) : []),
    [tab, linkRows],
  );

  const allPreviewFiles: PreviewFile[] = useMemo(
    () =>
      allAttachments
        .filter(({ att }) => {
          const k = classify(att.file.mime);
          return k === "image" || k === "video";
        })
        .map(({ att }) => toPreviewFile(att)),
    [allAttachments],
  );

  const tabs: Array<{
    key: Tab;
    label: string;
    icon: React.ReactNode;
    count: number;
  }> = [
    {
      key: "all",
      label: "Все",
      icon: <LayoutGrid size={14} />,
      count: counts.all + counts.links,
    },
    { key: "media", label: "Медиа", icon: <ImageIcon size={14} />, count: counts.media },
    { key: "files", label: "Файлы", icon: <FileText size={14} />, count: counts.files },
    { key: "voice", label: "Аудио", icon: <Music size={14} />, count: counts.voice },
    { key: "links", label: "Ссылки", icon: <ExternalLink size={14} />, count: counts.links },
  ];

  function openAttachmentCtx(e: React.MouseEvent, row: Row) {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ kind: "attachment", x: e.clientX, y: e.clientY, row });
  }

  function openLinkCtx(e: React.MouseEvent, row: LinkRow) {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ kind: "link", x: e.clientX, y: e.clientY, row });
  }

  function jumpToMessage() {
    if (!ctxMenu || !onJumpToMessageAction) return;
    onJumpToMessageAction(ctxMenu.row.message.uuid);
    setCtxMenu(null);
  }

  async function copyLink() {
    if (!ctxMenu) return;
    const url =
      ctxMenu.kind === "attachment"
        ? ctxMenu.row.att.file.url
        : ctxMenu.row.url;
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
    setCtxMenu(null);
  }

  // Определяем, что показывать по дате: сначала ссылки? нет — всё вместе.
  // Для таба «all» надо объединить даты из attachments и links.
  const allGrouped = useMemo(() => {
    if (tab !== "all") return [];

    const map = new Map<
      string,
      { links: LinkRow[]; attachments: Row[] }
    >();

    for (const l of linkRows) {
      const key = l.date.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, { links: [], attachments: [] });
      map.get(key)!.links.push(l);
    }
    for (const a of allAttachments) {
      const key = a.date.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, { links: [], attachments: [] });
      map.get(key)!.attachments.push(a);
    }

    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [tab, linkRows, allAttachments]);

  const isEmpty =
    tab === "links"
      ? groupedLinks.length === 0
      : tab === "all"
        ? allGrouped.length === 0
        : groupedAttachments.length === 0;

  return (
    <aside
      className="
        fixed inset-0 z-50 w-full
        lg:static lg:inset-auto lg:z-20 lg:w-[380px]
        shrink-0 h-full min-h-0 flex flex-col
        border-l border-(--border) bg-(--bg-card)
      "
    >
      {/* Хедер */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-(--border)">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-(--text-primary)">
            Вложения
          </h3>
          <p className="text-[11px] text-(--text-muted)">
            {counts.all}{" "}
            {counts.all === 1 ? "файл" : counts.all < 5 ? "файла" : "файлов"}
            {counts.links > 0 && (
              <>
                {" · "}
                {counts.links}{" "}
                {counts.links === 1
                  ? "ссылка"
                  : counts.links < 5
                    ? "ссылки"
                    : "ссылок"}
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onCloseAction}
          className="p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-primary) transition-colors"
          aria-label="Закрыть"
        >
          <X size={18} />
        </button>
      </div>

      {/* Табы */}
      <div className="relative shrink-0 border-b border-(--border)">
        <div
          ref={tabsRef}
          className="flex gap-1 p-2 overflow-x-auto"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
          onWheel={(e) => {
            if (
              e.deltaY !== 0 &&
              e.currentTarget.scrollWidth > e.currentTarget.clientWidth
            ) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              data-tab={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                tab === t.key
                  ? "bg-(--accent) text-white"
                  : "text-(--text-muted) hover:bg-(--bg-primary)"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    tab === t.key
                      ? "bg-white/20 text-white"
                      : "bg-(--bg-secondary) text-(--text-muted)"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-(--bg-card) to-transparent z-20" />
      </div>

      {/* Контент */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {isEmpty && (
          <div className="text-center py-12 text-sm text-(--text-muted)">
            {tab === "all" && "Нет вложений"}
            {tab === "media" && "Нет медиа"}
            {tab === "files" && "Нет файлов"}
            {tab === "voice" && "Нет аудио"}
            {tab === "links" && "Нет ссылок"}
          </div>
        )}

        {/* ===== Ссылки (отдельная вкладка) ===== */}
        {tab === "links" &&
          groupedLinks.map(([iso, items]) => (
            <div key={iso} className="mb-4">
              <div className="text-xs font-medium text-(--text-muted) mb-2 px-1">
                {dateLabel(iso)}
              </div>
              <div className="space-y-1">
                {items.map((row, idx) => (
                  <a
                    key={`${row.message.uuid}-${idx}`}
                    href={hrefFor(row.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onContextMenu={(e) => openLinkCtx(e, row)}
                    className="flex items-start gap-2 p-2 rounded-md bg-(--bg-primary) hover:bg-(--bg-secondary) transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-md bg-(--accent-dim) flex items-center justify-center shrink-0">
                      <ExternalLink size={14} className="text-(--accent)" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-(--text-primary) truncate group-hover:underline">
                        {row.url}
                      </p>
                      <p className="text-[10px] text-(--text-muted) truncate">
                        {row.message.user?.full_name ??
                          row.message.user?.username ??
                          "—"}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}

        {/* ===== Всё вместе (all) ===== */}
        {tab === "all" &&
          allGrouped.map(([iso, { links, attachments }]) => (
            <div key={iso} className="mb-4">
              <div className="text-xs font-medium text-(--text-muted) mb-2 px-1">
                {dateLabel(iso)}
              </div>

              {/* Ссылки — первыми */}
              {links.length > 0 && (
                <div className="space-y-1 mb-2">
                  {links.map((row, idx) => (
                    <a
                      key={`${row.message.uuid}-${idx}`}
                      href={hrefFor(row.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onContextMenu={(e) => openLinkCtx(e, row)}
                      className="flex items-start gap-2 p-2 rounded-md bg-(--bg-primary) hover:bg-(--bg-secondary) transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-md bg-(--accent-dim) flex items-center justify-center shrink-0">
                        <ExternalLink size={14} className="text-(--accent)" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-(--text-primary) truncate group-hover:underline">
                          {row.url}
                        </p>
                        <p className="text-[10px] text-(--text-muted) truncate">
                          {row.message.user?.full_name ??
                            row.message.user?.username ??
                            "—"}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* Вложения */}
              {attachments.length > 0 &&
                (attachments.some((it) => {
                  const k = classify(it.att.file.mime);
                  return k === "image" || k === "video";
                }) ? (
                  <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                    {attachments.map((row) => {
                      const a = row.att;
                      const kind = classify(a.file.mime);
                      const preview = toPreviewFile(a);
                      const isImg = kind === "image";
                      const isVid = kind === "video";

                      if (!isImg && !isVid) {
                        return (
                          <a
                            key={a.uuid}
                            href={a.file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={a.file.name}
                            onContextMenu={(e) => openAttachmentCtx(e, row)}
                            className="col-span-3 flex items-center gap-2 p-2 rounded-md bg-(--bg-primary) hover:bg-(--bg-secondary) transition-colors"
                          >
                            <div className="w-8 h-8 rounded-md bg-(--accent-dim) flex items-center justify-center shrink-0">
                              <FileText
                                size={14}
                                className="text-(--accent)"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-(--text-primary) truncate">
                                {a.file.name}
                              </p>
                              <p className="text-[10px] text-(--text-muted)">
                                {formatSize(a.file.size)}
                              </p>
                            </div>
                            <Download
                              size={14}
                              className="text-(--text-muted)"
                            />
                          </a>
                        );
                      }

                      return (
                        <button
                          key={a.uuid}
                          type="button"
                          onClick={() =>
                            onPreviewFileAction?.(preview, allPreviewFiles)
                          }
                          onContextMenu={(e) => openAttachmentCtx(e, row)}
                          className="relative aspect-square rounded-md overflow-hidden bg-(--bg-primary) group"
                        >
                          {isImg ? (
                            <Image
                              src={a.file.url}
                              alt={a.file.name}
                              fill
                              sizes="(max-width: 1024px) 33vw, 120px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film
                                size={20}
                                className="text-(--text-muted)"
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {attachments.map((row) => {
                      const a = row.att;
                      const kind = classify(a.file.mime);
                      const Icon =
                        kind === "audio"
                          ? Music
                          : kind === "doc"
                            ? FileText
                            : FileArchive;
                      return (
                        <a
                          key={a.uuid}
                          href={a.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={a.file.name}
                          onContextMenu={(e) => openAttachmentCtx(e, row)}
                          className="flex items-center gap-2 p-2 rounded-md bg-(--bg-primary) hover:bg-(--bg-secondary) transition-colors"
                        >
                          <div className="w-8 h-8 rounded-md bg-(--accent-dim) flex items-center justify-center shrink-0">
                            <Icon size={14} className="text-(--accent)" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-(--text-primary) truncate">
                              {a.file.name}
                            </p>
                            <p className="text-[10px] text-(--text-muted)">
                              {formatSize(a.file.size)}
                            </p>
                          </div>
                          <Download
                            size={14}
                            className="text-(--text-muted)"
                          />
                        </a>
                      );
                    })}
                  </div>
                ))}
            </div>
          ))}

        {/* ===== Вложения (media/files/voice) ===== */}
        {tab !== "links" &&
          tab !== "all" &&
          groupedAttachments.map(([iso, items]) => (
            <div key={iso} className="mb-4">
              <div className="text-xs font-medium text-(--text-muted) mb-2 px-1">
                {dateLabel(iso)}
              </div>

              {tab === "media" ? (
                <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                  {items.map((row) => {
                    const a = row.att;
                    const kind = classify(a.file.mime);
                    if (kind !== "image" && kind !== "video") return null;

                    const preview = toPreviewFile(a);
                    const isImg = kind === "image";
                    return (
                      <button
                        key={a.uuid}
                        type="button"
                        onClick={() =>
                          onPreviewFileAction?.(preview, allPreviewFiles)
                        }
                        onContextMenu={(e) => openAttachmentCtx(e, row)}
                        className="relative aspect-square rounded-md overflow-hidden bg-(--bg-primary) group"
                      >
                        {isImg ? (
                          <Image
                            src={a.file.url}
                            alt={a.file.name}
                            fill
                            sizes="(max-width: 1024px) 33vw, 120px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film
                              size={20}
                              className="text-(--text-muted)"
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  {items.map((row) => {
                    const a = row.att;
                    const kind = classify(a.file.mime);
                    const Icon =
                      kind === "audio"
                        ? Music
                        : kind === "doc"
                          ? FileText
                          : FileArchive;
                    return (
                      <a
                        key={a.uuid}
                        href={a.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={a.file.name}
                        onContextMenu={(e) => openAttachmentCtx(e, row)}
                        className="flex items-center gap-2 p-2 rounded-md bg-(--bg-primary) hover:bg-(--bg-secondary) transition-colors"
                      >
                        <div className="w-8 h-8 rounded-md bg-(--accent-dim) flex items-center justify-center shrink-0">
                          <Icon size={14} className="text-(--accent)" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-(--text-primary) truncate">
                            {a.file.name}
                          </p>
                          <p className="text-[10px] text-(--text-muted)">
                            {formatSize(a.file.size)}
                          </p>
                        </div>
                        <Download
                          size={14}
                          className="text-(--text-muted)"
                        />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Контекстное меню — через portal */}
      {ctxMenu &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              top: Math.min(ctxMenu.y, window.innerHeight - 120),
              left: Math.min(ctxMenu.x, window.innerWidth - 220),
            }}
            className="fixed z-[9999] min-w-52 py-1 rounded-lg bg-(--bg-card) border border-(--border) shadow-xl"
          >
            {onJumpToMessageAction && (
              <button
                type="button"
                role="menuitem"
                onClick={jumpToMessage}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-(--text-primary) hover:bg-(--bg-primary) transition-colors"
              >
                <MessageSquare size={15} />
                Показать в чате
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={copyLink}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-(--text-primary) hover:bg-(--bg-primary) transition-colors"
            >
              <Copy size={15} />
              {ctxMenu.kind === "link" ? "Скопировать ссылку" : "Скопировать URL файла"}
            </button>
          </div>,
          document.body,
        )}
    </aside>
  );
}