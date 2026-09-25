// src/components/chat/MessageBubble.tsx
"use client";

import { useState, useSyncExternalStore, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Check, CheckCheck, CornerUpLeft, Forward } from "lucide-react";
import type { ChatMessageItem } from "@/lib/db/chat";
import { MessageContextMenu } from "./MessageContextMenu";

function formatTime(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({
  message,
  currentUserUuid,
  replyToMessage,
  onReplyAction,
  onCopyAction,
  onEditAction,
  onDeleteAction,
  onReactAction,
  onForwardAction,
  onJumpToReplyAction,
}: {
  message: ChatMessageItem;
  currentUserUuid: string;
  replyToMessage?: ChatMessageItem | null;
  onReplyAction?: (message: ChatMessageItem) => void;
  onCopyAction?: (message: ChatMessageItem) => void;
  onEditAction?: (message: ChatMessageItem) => void;
  onDeleteAction?: (message: ChatMessageItem) => void;
  onReactAction?: (message: ChatMessageItem, emoji: string) => void;
  onForwardAction?: (message: ChatMessageItem) => void;
  onJumpToReplyAction?: (messageUuid: string) => void;
}) {
  const isOwn = message.user?.uuid === currentUserUuid;
  const isSystem = message.kind === "system" || message.kind === "status_change";

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  // Подписка на "мы на клиенте" — работает без setState и ESLint-ошибок
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,   // client snapshot
    () => false,  // server snapshot
  );

  // Системные сообщения (вход/выход, смена статуса)
  if (isSystem) {
    return (
      <div className="text-center py-1">
        <span className="text-xs text-(--text-muted) italic px-2 py-0.5 rounded-full bg-(--bg-primary)">
          {message.content}
        </span>
      </div>
    );
  }

  // Удалённые сообщения — плашка вместо пузыря
  if (message.deleted_at) {
    return (
      <div className="text-center py-1">
        <span className="text-xs text-(--text-muted) italic px-2 py-0.5 rounded-full bg-(--bg-primary)">
          Сообщение удалено
        </span>
      </div>
    );
  }

  const isRead =
    isOwn && message.read_receipts.some((r) => r.user_uuid !== currentUserUuid);

  function handleContextMenu(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  }

  // Группировка реакций по эмодзи
  const reactionGroups = message.reactions.reduce<
    Record<string, { count: number; mine: boolean }>
  >((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
    acc[r.emoji].count += 1;
    if (r.user_uuid === currentUserUuid) acc[r.emoji].mine = true;
    return acc;
  }, {});

  return (
    <div className="relative">
      <div
        className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
        onContextMenu={handleContextMenu}
      >
        {/* Аватар (только для чужих) */}
        {!isOwn && (
          <div className="w-8 h-8 rounded-full bg-(--bg-primary) border border-(--border) flex items-center justify-center shrink-0 overflow-hidden">
            {message.user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.user.avatar_url}
                alt={message.user.full_name ?? ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-(--text-muted)">
                {(message.user?.full_name ?? message.user?.username ?? "?")
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* Пузырь */}
        <div
          className={`max-w-[70%] ${
            isOwn ? "items-end" : "items-start"
          } flex flex-col`}
        >
          {/* Имя автора (только для чужих, в группах) */}
          {!isOwn && message.user && (
            <div className="text-xs text-(--text-muted) mb-0.5 px-1">
              {message.user.full_name ?? message.user.username ?? "—"}
            </div>
          )}

          <div
            className={`px-3 py-2 rounded-2xl text-sm ${
              isOwn
                ? "bg-(--accent) text-(--bg-card) rounded-br-sm"
                : "bg-(--bg-primary) text-(--text-primary) rounded-bl-sm"
            }`}
          >
            {/* Метка «Переслано» */}
            {message.forwarded_from_message_uuid && (
              <div
                className={`flex items-center gap-1 text-[10px] mb-1 italic ${
                  isOwn ? "text-white/70" : "text-(--text-muted)"
                }`}
              >
                <Forward size={10} />
                  Переслано
              </div>
            )}
            {/* Reply preview */}
            {message.reply_to_uuid && replyToMessage && (
              <button
                type="button"
                onClick={() => onJumpToReplyAction?.(message.reply_to_uuid!)}
                className={`block w-full text-left mb-1.5 px-2 py-1 rounded-lg border-l-2 ${
                  isOwn
                    ? "bg-black/10 border-white/40 text-white/80"
                    : "bg-(--bg-card) border-(--accent) text-(--text-muted)"
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] mb-0.5">
                  <CornerUpLeft size={10} />
                  <span>
                    {replyToMessage.user?.full_name ??
                      replyToMessage.user?.username ??
                      "Сообщение"}
                  </span>
                </div>
                <div className="text-xs truncate">
                  {replyToMessage.content.slice(0, 100)}
                </div>
              </button>
            )}

            {message.content && (
              <div className="whitespace-pre-wrap wrapbreak-word">
                {message.content}
                {message.edited_at && (
                  <span className="ml-1 text-[10px] opacity-60">(изм.)</span>
                )}
              </div>
            )}

            {/* Вложения */}
            {message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((a) => {
                  const isImage = a.file.mime?.startsWith("image/");
                  return (
                    <a
                      key={a.uuid}
                      href={a.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block rounded-lg overflow-hidden ${
                        isOwn ? "bg-black/10" : "bg-(--bg-card)"
                      }`}
                    >
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.file.url}
                          alt={a.file.name}
                          className="max-w-full max-h-64 object-contain"
                        />
                      ) : (
                        <div className="px-2 py-1.5 text-xs truncate">
                          📎 {a.file.name}
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Реакции */}
          {Object.keys(reactionGroups).length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
              {Object.entries(reactionGroups).map(([emoji, { count, mine }]) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onReactAction?.(message, emoji)}
                  className={`text-xs px-1.5 py-0.5 rounded-full border transition-colors ${
                    mine
                      ? "bg-(--accent-dim) border-(--accent)"
                      : "bg-(--bg-primary) border-(--border) hover:border-(--accent)"
                  }`}
                >
                  {emoji} {count}
                </button>
              ))}
            </div>
          )}

          {/* Время и статус прочтения */}
          <div
            className={`flex items-center gap-1 mt-0.5 px-1 text-[10px] text-(--text-muted) ${
              isOwn ? "flex-row-reverse" : ""
            }`}
          >
            <span>{formatTime(message.created_at)}</span>
            {isOwn && (
              <span title={isRead ? "Прочитано" : "Отправлено"}>
                {isRead ? (
                  <CheckCheck size={12} className="text-(--accent)" />
                ) : (
                  <Check size={12} />
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Контекстное меню */}
      {menu && mounted && createPortal (
        <MessageContextMenu
          x={menu.x}
          y={menu.y}
          isOwn={isOwn}
          onCloseAction={() => setMenu(null)}
          onReplyAction={() => onReplyAction?.(message)}
          onCopyAction={() => onCopyAction?.(message)}
          onEditAction={() => onEditAction?.(message)}
          onDeleteAction={() => onDeleteAction?.(message)}
          onForwardAction={() => onForwardAction?.(message)}
          onReactAction={(emoji) => {
            if (emoji !== "more") onReactAction?.(message, emoji);
          }}
        />,
        document.body,
      )}
    </div>
  );
}
