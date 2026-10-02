// src/components/chat/MessageBubble.tsx
"use client";

import { useState, useSyncExternalStore, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Check, CheckCheck, CornerUpLeft, Forward, Pin } from "lucide-react";
import type { ChatMessageItem } from "@/lib/db/chat";
import type { PreviewFile } from "./MediaPreviewModal";
import { MessageContextMenu } from "./MessageContextMenu";
import { ClientOnly } from "@/components/ClientOnly";
import { formatMessageTime } from "@/lib/format-time";

export function MessageBubble({
  message,
  currentUserUuid,
  replyToMessage,
  isPinned,
  onReplyAction,
  onCopyAction,
  onEditAction,
  onDeleteAction,
  onReactAction,
  onForwardAction,
  onPinAction,
  onJumpToReplyAction,
  onPreviewFileAction,
}: {
  message: ChatMessageItem;
  currentUserUuid: string;
  replyToMessage?: ChatMessageItem | null;
  isPinned?: boolean;
  onReplyAction?: (message: ChatMessageItem) => void;
  onCopyAction?: (message: ChatMessageItem) => void;
  onEditAction?: (message: ChatMessageItem) => void;
  onDeleteAction?: (message: ChatMessageItem, scope: "self" | "everyone") => void;
  onReactAction?: (message: ChatMessageItem, emoji: string) => void;
  onForwardAction?: (message: ChatMessageItem) => void;
  onPinAction?: (message: ChatMessageItem, scope: "self" | "everyone") => void;
  onJumpToReplyAction?: (messageUuid: string) => void;
  onPreviewFileAction?: (file: PreviewFile, allFiles: PreviewFile[]) => void;
}) {
  const isOwn = message.user?.uuid === currentUserUuid;
  const isSystem = message.kind === "system" || message.kind === "status_change";

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (isSystem) {
    return (
      <div className="text-center py-1">
        <span className="text-xs text-(--text-muted) italic px-2 py-0.5 rounded-full bg-(--bg-primary)">
          {message.content}
        </span>
      </div>
    );
  }

  if (message.deleted_at) {
    const deleter = message.deleted_by;
    const isMe = deleter?.uuid === currentUserUuid;
    const name = deleter?.full_name ?? deleter?.username;
    return (
      <div className="text-center py-1">
        <span className="text-xs text-(--text-muted) italic px-2 py-0.5 rounded-full bg-(--bg-primary)">
          {isMe || !name ? "Сообщение удалено" : `${name} удалил(а) сообщение`}
        </span>
      </div>
    );
  }

  const isRead =
    isOwn && message.read_receipts.some((r) => r.user_uuid !== currentUserUuid);

  const filesInMessage: PreviewFile[] = message.attachments.map((a) => ({
    id: a.file.id,
    uuid: a.file.uuid,
    name: a.file.name,
    url: a.file.url,
    mime: a.file.mime,
    size: a.file.size,
  }));

  function handleContextMenu(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  }

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

        <div
          className={`max-w-[70%] ${
            isOwn ? "items-end" : "items-start"
          } flex flex-col`}
        >
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

            {message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((a) => {
                  const isImage = a.file.mime?.startsWith("image/");
                  const file: PreviewFile = {
                    id: a.file.id,
                    uuid: a.file.uuid,
                    name: a.file.name,
                    url: a.file.url,
                    mime: a.file.mime,
                    size: a.file.size,
                  };
                  return (
                    <button
                      key={a.uuid}
                      type="button"
                      onClick={() => onPreviewFileAction?.(file, filesInMessage)}
                      className={`block w-full text-left rounded-lg overflow-hidden cursor-zoom-in ${
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
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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

          <div
            className={`flex items-center gap-1 mt-0.5 px-1 text-[10px] text-(--text-muted) ${
              isOwn ? "flex-row-reverse" : ""
            }`}
          >
            {isPinned && (
              <span title="Закреплено" className="text-(--accent)">
                <Pin size={12} />
              </span>
            )}
            <span>
              <ClientOnly>{formatMessageTime(message.created_at)}</ClientOnly>
            </span>
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

      {menu && mounted && createPortal (
        <MessageContextMenu
          x={menu.x}
          y={menu.y}
          isOwn={isOwn}
          onCloseAction={() => setMenu(null)}
          onReplyAction={() => onReplyAction?.(message)}
          onCopyAction={() => onCopyAction?.(message)}
          onEditAction={() => onEditAction?.(message)}
          onDeleteAction={
            onDeleteAction ? (scope) => onDeleteAction(message, scope) : undefined
          }
          onForwardAction={() => onForwardAction?.(message)}
          onPinAction={
            onPinAction ? (scope) => onPinAction(message, scope) : undefined
          }
          onReactAction={(emoji) => {
            if (emoji !== "more") onReactAction?.(message, emoji);
          }}
        />,
        document.body,
      )}
    </div>
  );
}
