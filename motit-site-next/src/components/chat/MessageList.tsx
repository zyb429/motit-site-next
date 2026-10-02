// src/components/chat/MessageList.tsx
"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import type { ChatMessageItem } from "@/lib/db/chat";
import type { PreviewFile } from "./MediaPreviewModal";
import { MessageBubble } from "./MessageBubble";
import { dayKey } from "@/lib/format-time";
import { DateDivider } from "./DateDivider";

export function MessageList({
  messages,
  currentUserUuid,
  onLoadMoreAction,
  hasMore,
  pinnedUuids,
  onReplyAction,
  onCopyAction,
  onEditAction,
  onDeleteAction,
  onReactAction,
  onForwardAction,
  onPinAction,
  onPreviewFileAction,
}: {
  messages: ChatMessageItem[];
  currentUserUuid: string;
  onLoadMoreAction?: () => void;
  hasMore?: boolean;
  pinnedUuids?: Set<string>;
  onReplyAction?: (message: ChatMessageItem) => void;
  onCopyAction?: (message: ChatMessageItem) => void;
  onEditAction?: (message: ChatMessageItem) => void;
  onDeleteAction?: (message: ChatMessageItem, scope: "self" | "everyone") => void;
  onReactAction?: (message: ChatMessageItem, emoji: string) => void;
  onForwardAction?: (message: ChatMessageItem) => void;
  onPinAction?: (message: ChatMessageItem, scope: "self" | "everyone") => void;
  onPreviewFileAction?: (file: PreviewFile, allFiles: PreviewFile[]) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((m) => {
      if (!m.uuid) return false;
      if (seen.has(m.uuid)) return false;
      seen.add(m.uuid);
      return true;
    });
  }, [messages]);

  const messagesByUuid = useMemo(
    () => new Map(uniqueMessages.map((m) => [m.uuid, m])),
    [uniqueMessages],
  );

  type RenderItem =
    | { kind: "divider"; key: string; date: Date }
    | { kind: "message"; key: string; message: ChatMessageItem };

  const renderItems = useMemo<RenderItem[]>(() => {
    const items: RenderItem[] = [];
    let lastDay: string | null = null;

    for (const m of uniqueMessages) {
      if (!m.created_at) continue;
      const d =
        typeof m.created_at === "string" ? new Date(m.created_at) : m.created_at;
      const key = dayKey(d);

      if (key !== lastDay) {
        items.push({ kind: "divider", key: `divider-${key}`, date: d });
        lastDay = key;
      }
      items.push({ kind: "message", key: m.uuid, message: m });
    }

    return items;
  }, [uniqueMessages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [uniqueMessages.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prevScrollHeightRef.current > 0 && uniqueMessages.length > 0) {
      const diff = container.scrollHeight - prevScrollHeightRef.current;
      if (diff > 0) {
        container.scrollTop += diff;
      }
    }
    prevScrollHeightRef.current = container.scrollHeight;
  }, [uniqueMessages.length]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !onLoadMoreAction || !hasMore) return;
    if (container.scrollTop < 100) onLoadMoreAction();
  }, [onLoadMoreAction, hasMore]);

  function jumpToMessage(messageUuid: string) {
    const el = document.querySelector(`[data-message-uuid="${messageUuid}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-(--accent)", "rounded-2xl");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-(--accent)", "rounded-2xl");
      }, 1500);
    }
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3"
    >
      {hasMore && (
        <div className="text-center py-2">
          <button
            type="button"
            onClick={onLoadMoreAction}
            className="text-xs text-(--text-muted) hover:text-(--accent)"
          >
            Загрузить ещё…
          </button>
        </div>
      )}

      {uniqueMessages.length === 0 ? (
        <div className="text-center py-12 text-sm text-(--text-muted)">
          Сообщений пока нет. Начните первым!
        </div>
      ) : (
        <>
          {renderItems.map((item) =>
            item.kind === "divider" ? (
              <DateDivider key={item.key} date={item.date} />
            ) : (
              <div key={item.key} data-message-uuid={item.message.uuid}>
                <MessageBubble
                  message={item.message}
                  currentUserUuid={currentUserUuid}
                  isPinned={pinnedUuids?.has(item.message.uuid)}
                  replyToMessage={
                    item.message.reply_to_uuid
                      ? messagesByUuid.get(item.message.reply_to_uuid) ?? null
                      : null
                  }
                  onReplyAction={onReplyAction}
                  onCopyAction={onCopyAction}
                  onEditAction={onEditAction}
                  onDeleteAction={onDeleteAction}
                  onReactAction={onReactAction}
                  onForwardAction={onForwardAction}
                  onPinAction={onPinAction}
                  onJumpToReplyAction={jumpToMessage}
                  onPreviewFileAction={onPreviewFileAction}
                />
              </div>
            ),
          )}
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
