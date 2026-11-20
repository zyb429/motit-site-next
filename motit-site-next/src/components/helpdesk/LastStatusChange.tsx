"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { History, ArrowRight, User2, ChevronDown, X, Clock } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import {
  timeAgo,
  shortUser,
  type LastStatusChange,
  type StatusHistoryEntry,
} from "@/lib/tickets/status-history-types";

export function LastStatusChangeBlock({
  change,
  history,
  hideAuthor = false,
  className = "",
}: {
  change: LastStatusChange | null;
  history?: StatusHistoryEntry[];
  hideAuthor?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Позиционирование десктопного поповера
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = 400;
    const padding = 16;
    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - padding) {
      left = window.innerWidth - popoverWidth - padding;
    }
    setPosition({ top: rect.bottom + 8, left: Math.max(padding, left) });
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [open, updatePosition]);

  // Блокируем прокрутку только для открытой мобильной модалки.
  useEffect(() => {
    if (!open) return;

    const media = window.matchMedia("(max-width: 639px)");
    const previousOverflow = document.body.style.overflow;

    const syncOverflow = () => {
      document.body.style.overflow = media.matches
        ? "hidden"
        : previousOverflow;
    };

    syncOverflow();
    media.addEventListener("change", syncOverflow);

    return () => {
      media.removeEventListener("change", syncOverflow);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Закрытие по клику вне поповера (десктоп)
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (window.innerWidth < 640) return;
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Закрытие по Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!change?.status) return null;

  const hasHistory = history && history.length > 1;

  const historyContent = (
    <ul className="space-y-4 sm:space-y-5">
      {history?.map((h, i) => (
        <li key={i} className="relative flex gap-3 sm:gap-4">
          <div className="relative flex flex-col items-center shrink-0 pt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-(--accent) ring-4 ring-(--accent-dim)" />
            {i < history.length - 1 && (
              <div className="w-px flex-1 bg-(--border) mt-1.5" />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {h.old_status?.code && (
                <>
                  <StatusBadge code={h.old_status.code} />
                  <ArrowRight size={12} className="text-(--text-muted) shrink-0" />
                </>
              )}
              {h.status?.code && <StatusBadge code={h.status.code} />}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-(--text-muted)">
              {!hideAuthor && h.changed_by && (
                <span className="inline-flex items-center gap-1.5">
                  <User2 size={12} className="shrink-0" />
                  <span className="font-medium text-(--text-primary)">
                    {shortUser(h.changed_by)}
                  </span>
                </span>
              )}
              {h.changed_at && (
                <span
                  className="inline-flex items-center gap-1.5"
                  title={new Date(h.changed_at).toLocaleString("ru-RU")}
                >
                  <Clock size={12} className="shrink-0" />
                  {timeAgo(h.changed_at)}
                </span>
              )}
            </div>
            {h.comment && (
              <div className="mt-2 text-xs sm:text-sm text-(--text-secondary) italic leading-relaxed pl-3 border-l-2 border-(--border)">
                {h.comment}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (hasHistory) setOpen((v) => !v);
        }}
        className={`group inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm transition-all -mx-2 px-2 py-1.5 rounded-lg ${
          hasHistory
            ? "cursor-pointer text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary)"
            : "cursor-default text-(--text-muted)"
        }`}
      >
        <History size={14} className="shrink-0 transition-colors group-hover:text-(--accent)" />
        <span className="font-medium">Статус:</span>
        {change.old_status?.code && (
          <>
            <StatusBadge code={change.old_status.code} />
            <ArrowRight size={12} className="text-(--text-muted) shrink-0" />
          </>
        )}
        <StatusBadge code={change.status.code ?? undefined} />
        {!hideAuthor && change.changed_by && (
          <>
            <span className="text-(--text-muted) hidden sm:inline">·</span>
            <span className="hidden sm:inline font-medium text-(--text-primary)">
              {shortUser(change.changed_by)}
            </span>
          </>
        )}
        {change.changed_at && (
          <span className="text-(--text-muted) hidden sm:inline">
            · {timeAgo(change.changed_at)}
          </span>
        )}
        {hasHistory && (
          <ChevronDown
            size={14}
            className={`shrink-0 transition-all duration-200 ${
              open ? "rotate-180 text-(--accent)" : "group-hover:text-(--accent)"
            }`}
          />
        )}
      </button>

      {hasHistory && open && mounted && (
        <>
          {/* Десктоп: поповер */}
          {createPortal(
            <div
              ref={popoverRef}
              className="hidden sm:block rounded-2xl border border-(--border) bg-(--bg-card) shadow-2xl shadow-black/10 dark:shadow-black/40"
              style={{
                position: "fixed",
                zIndex: 9999,
                top: position.top,
                left: position.left,
                width: 400,
                maxWidth: "calc(100vw - 2rem)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-5 py-4 border-b border-(--border) bg-(--bg-secondary)/40 rounded-t-2xl">
                <div className="w-8 h-8 rounded-lg bg-(--accent-dim) flex items-center justify-center">
                  <History size={16} className="text-(--accent)" />
                </div>

                <div>
                  <div className="text-sm font-semibold text-(--text-primary)">
                    История статусов
                  </div>

                  <div className="text-xs text-(--text-muted)">
                    {history.length}{" "}
                    {history.length % 10 === 1 &&
                    history.length % 100 !== 11
                      ? "запись"
                      : history.length % 10 >= 2 &&
                          history.length % 10 <= 4 &&
                          (history.length % 100 < 12 ||
                            history.length % 100 > 14)
                        ? "записи"
                        : "записей"}
                  </div>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-5">
                {historyContent}
              </div>
            </div>,
            document.body
          )}

          {/* Мобильные: модалка по центру */}
          {createPortal(
            <div
              className="sm:hidden flex items-center justify-center p-4 pt-safe pb-safe"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              <div
                role="dialog"
                aria-modal="true"
                aria-label="История статусов"
                className="relative w-full max-w-md max-h-[85vh] rounded-2xl border border-(--border) bg-(--bg-card) shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-(--border) shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-(--accent-dim) flex items-center justify-center shrink-0">
                    <History size={18} className="text-(--accent)" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-(--text-primary)">
                      История статусов
                    </div>

                    <div className="text-xs text-(--text-muted)">
                      {history.length}{" "}
                      {history.length % 10 === 1 &&
                      history.length % 100 !== 11
                        ? "запись"
                        : history.length % 10 >= 2 &&
                            history.length % 10 <= 4 &&
                            (history.length % 100 < 12 ||
                              history.length % 100 > 14)
                          ? "записи"
                          : "записей"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-lg text-(--text-muted) hover:bg-(--bg-secondary) hover:text-(--text-primary) active:scale-95 transition-all"
                    aria-label="Закрыть"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4">
                  {historyContent}
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}