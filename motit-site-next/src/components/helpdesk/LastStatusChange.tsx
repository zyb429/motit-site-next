// src/components/helpdesk/LastStatusChange.tsx
import { History, ArrowRight, User2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import {
  timeAgo,
  shortUser,
  type LastStatusChange,
  type StatusHistoryEntry,
} from "@/lib/db/ticket-status-history";

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
  if (!change?.status) return null;

  const hasHistory = history && history.length > 1;

  return (
    <div className={`group relative inline-block ${className}`}>
      <div
        className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-(--text-muted) cursor-help"
        title={
          change.changed_at
            ? new Date(change.changed_at).toLocaleString("ru-RU")
            : undefined
        }
      >
        <History size={12} className="shrink-0" />
        <span>Статус:</span>
        {change.old_status?.code && (
          <>
            <StatusBadge code={change.old_status.code} />
            <ArrowRight size={11} className="opacity-60" />
          </>
        )}
        <StatusBadge code={change.status.code ?? undefined} />
        {!hideAuthor && change.changed_by && (
          <>
            <span className="opacity-60">·</span>
            <span className="text-(--text-primary)">
              {shortUser(change.changed_by)}
            </span>
          </>
        )}
        {change.changed_at && (
          <span className="opacity-75">· {timeAgo(change.changed_at)}</span>
        )}
        {hasHistory && <span className="opacity-50 text-[10px]">▼</span>}
      </div>

      {hasHistory && (
        <div
          className="
            pointer-events-none absolute left-0 top-full z-50 mt-2 w-[min(420px,90vw)]
            opacity-0 translate-y-1
            group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-150
            rounded-xl border border-(--border) bg-(--bg-card) shadow-xl
            p-3
          "
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-(--text-muted) mb-2 flex items-center gap-1.5">
            <History size={11} />
            История статусов
          </div>
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {history.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-(--text-secondary)">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-(--accent) shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    {h.old_status?.code && (
                      <>
                        <StatusBadge code={h.old_status.code} />
                        <ArrowRight size={10} className="opacity-60" />
                      </>
                    )}
                    {h.status?.code && <StatusBadge code={h.status.code} />}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-(--text-muted) mt-1">
                    {!hideAuthor && h.changed_by && (
                      <span className="inline-flex items-center gap-1">
                        <User2 size={10} />
                        {shortUser(h.changed_by)}
                      </span>
                    )}
                    {h.changed_at && (
                      <span title={new Date(h.changed_at).toLocaleString("ru-RU")}>
                        {timeAgo(h.changed_at)}
                      </span>
                    )}
                  </div>
                  {h.comment && (
                    <div className="text-[11px] text-(--text-muted) italic mt-0.5">
                      {h.comment}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
