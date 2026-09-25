// src/components/chat/MessageList.tsx
"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import type { ChatMessageItem } from "@/lib/db/chat";
import { MessageBubble } from "./MessageBubble";

export function MessageList({
  messages,
  currentUserUuid,
  onLoadMoreAction,
  hasMore,
  onReplyAction,
  onCopyAction,
  onEditAction,
  onDeleteAction,
  onReactAction,
  onForwardAction,
}: {
  messages: ChatMessageItem[];
  currentUserUuid: string;
  onLoadMoreAction?: () => void;
  hasMore?: boolean;
  onReplyAction?: (message: ChatMessageItem) => void;
  onCopyAction?: (message: ChatMessageItem) => void;
  onEditAction?: (message: ChatMessageItem) => void;
  onDeleteAction?: (message: ChatMessageItem) => void;
  onReactAction?: (message: ChatMessageItem, emoji: string) => void;
  onForwardAction?: (message: ChatMessageItem) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // Индекс uuid → message для быстрого поиска replyTo
  const messagesByUuid = useMemo(
    () => new Map(messages.map((m) => [m.uuid, m])),
    [messages],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prevScrollHeightRef.current > 0 && messages.length > 0) {
      const diff = container.scrollHeight - prevScrollHeightRef.current;
      if (diff > 0) {
        container.scrollTop += diff;
      }
    }
    prevScrollHeightRef.current = container.scrollHeight;
  }, [messages.length]);

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
      className="flex-1 overflow-y-auto p-4 space-y-3"
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

      {messages.length === 0 ? (
        <div className="text-center py-12 text-sm text-(--text-muted)">
          Сообщений пока нет. Начните первым!
        </div>
      ) : (
        <>
          {messages.map((m) => (
            <div key={m.uuid} data-message-uuid={m.uuid}>
              <MessageBubble
                message={m}
                currentUserUuid={currentUserUuid}
                replyToMessage={
                  m.reply_to_uuid
                    ? messagesByUuid.get(m.reply_to_uuid) ?? null
                    : null
                }
                onReplyAction={onReplyAction}
                onCopyAction={onCopyAction}
                onEditAction={onEditAction}
                onDeleteAction={onDeleteAction}
                onReactAction={onReactAction}
                onForwardAction={onForwardAction}
                onJumpToReplyAction={jumpToMessage}
              />
            </div>
          ))}
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
