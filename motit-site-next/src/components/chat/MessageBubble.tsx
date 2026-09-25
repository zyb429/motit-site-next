// src/components/chat/MessageBubble.tsx
"use client";

import { Check, CheckCheck } from "lucide-react";
import type { ChatMessageItem } from "@/lib/db/chat";

function formatTime(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({
  message,
  currentUserUuid,
}: {
  message: ChatMessageItem;
  currentUserUuid: string;
}) {
  const isOwn = message.user?.uuid === currentUserUuid;
  const isSystem = message.kind === "system" || message.kind === "status_change";

  // Системные сообщения — по центру, серым
  if (isSystem) {
    return (
      <div className="text-center py-1">
        <span className="text-xs text-(--text-muted) italic px-2 py-0.5 rounded-full bg-(--bg-primary)">
          {message.content}
        </span>
      </div>
    );
  }

  // Проверяем, прочитано ли сообщение кем-то ещё
  const isRead =
    isOwn &&
    message.read_receipts.some((r) => r.user_uuid !== currentUserUuid);

  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
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
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
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
          {message.content && (
            <div className="whitespace-pre-wrap wrap-break-words">
              {message.content}
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
          {message.edited_at && <span>(изменено)</span>}
        </div>
      </div>
    </div>
  );
}
