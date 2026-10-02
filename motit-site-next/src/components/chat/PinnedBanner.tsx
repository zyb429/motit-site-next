// src/components/chat/PinnedBanner.tsx
"use client";

import { useState } from "react";
import { Pin, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { PinnedMessageItem } from "@/lib/db/chat";

export function PinnedBanner({
  pinned,
  onJumpAction,
  onUnpinAction,
}: {
  pinned: PinnedMessageItem[];
  onJumpAction: (messageUuid: string) => void;
  onUnpinAction: (messageUuid: string, scope: "self" | "everyone") => void;
}) {
  const [index, setIndex] = useState(0);

  if (pinned.length === 0) return null;

  const current = pinned[Math.min(index, pinned.length - 1)];

  const authorName =
    current.message.user?.full_name ??
    current.message.user?.username ??
    "Без имени";

  const preview =
    current.message.deleted_at
      ? "Сообщение удалено"
      : current.message.content.slice(0, 120) ||
        (current.message.attachments.length > 0 ? "Вложение" : "Сообщение");

  return (
    <div className="border-b border-(--border) bg-(--bg-elevated) px-3 py-2 flex items-center gap-2">
      <Pin className="w-4 h-4 text-(--accent) shrink-0" />

      <button
        type="button"
        onClick={() => onJumpAction(current.message.uuid)}
        className="flex-1 min-w-0 text-left"
      >
        <div className="text-[11px] text-(--accent) font-medium truncate">
          {current.scope === "everyone" ? "Закреплено" : "Закреплено у вас"}
          {" · "}
          {authorName}
        </div>
        <div className="text-xs text-(--text-muted) truncate">{preview}</div>
      </button>

      {pinned.length > 1 && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + pinned.length) % pinned.length)}
            className="p-1 rounded hover:bg-(--bg-hover)"
            aria-label="Предыдущий закреп"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-(--text-muted)">
            {index + 1}/{pinned.length}
          </span>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % pinned.length)}
            className="p-1 rounded hover:bg-(--bg-hover)"
            aria-label="Следующий закреп"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => onUnpinAction(current.message.uuid, current.scope)}
        className="p-1 rounded hover:bg-(--bg-hover) shrink-0"
        aria-label="Открепить"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
