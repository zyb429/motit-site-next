// src/components/chat/MessageList.tsx
"use client";

import { useEffect, useRef } from "react";
import type { ChatMessageItem } from "@/lib/db/chat";
import { MessageBubble } from "./MessageBubble";

export function MessageList({
  messages,
  currentUserUuid,
  onLoadMoreAction,
  hasMore,
}: {
  messages: ChatMessageItem[];
  currentUserUuid: string;
  onLoadMoreAction?: () => void;
  hasMore?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // Автоскролл вниз при новых сообщениях (если пользователь уже был внизу)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Сохраняем позицию скролла при подгрузке старых сообщений
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

  function handleScroll() {
    const container = containerRef.current;
    if (!container || !onLoadMoreAction || !hasMore) return;

    if (container.scrollTop < 100) {
      onLoadMoreAction();
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
            <MessageBubble
              key={m.uuid}
              message={m}
              currentUserUuid={currentUserUuid}
            />
          ))}
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
