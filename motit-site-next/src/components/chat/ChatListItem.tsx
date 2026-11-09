// src/components/chat/ChatListItem.tsx
"use client";

import Link from "next/link";
import { Users, Hash, Lock, Pin, BellOff } from "lucide-react";
import type { ChatListItem as ChatListItemType } from "@/lib/db/chat";
import { ClientOnly } from "@/components/ClientOnly";
import { formatChatListTime } from "@/lib/format-time";

export function ChatListItem({
  chat,
  currentUserUuid,
  href,
  isActive,
  onContextMenuAction,
  onChatClickAction,
}: {
  chat: ChatListItemType;
  currentUserUuid: string;
  href: string;
  isActive: boolean;
  onContextMenuAction?: (
    chat: ChatListItemType,
    x: number,
    y: number,
  ) => void;
  onChatClickAction?: (chat: ChatListItemType) => void;
}) {
  const otherMember = chat.members.find((m) => m.user.uuid !== currentUserUuid);

  const displayName =
    chat.kind === "direct"
      ? otherMember?.user.full_name ??
        otherMember?.user.username ??
        "Без имени"
      : chat.name ?? "Без названия";

  const KindIcon =
    chat.kind === "private_channel"
      ? Lock
      : chat.kind === "channel"
        ? Hash
        : chat.kind === "group"
          ? Users
          : null;

  const isSystemMessage =
    chat.last_message?.kind === "system" ||
    chat.last_message?.kind === "status_change";

  const lastMessageAuthor = chat.last_message?.user;
  const isMyMessage = lastMessageAuthor?.uuid === currentUserUuid;

  // В группах/каналах/тикетах автора показываем всегда (даже для системных)
  // В ЛС автора показываем только когда сообщение моё ("Вы:")
  // В Saved Messages автора не показываем вообще
  const isGroupLike =
    chat.kind === "group" ||
    chat.kind === "channel" ||
    chat.kind === "private_channel" ||
    chat.kind === "ticket";

  let authorName: string | null = null;

  if (chat.kind === "saved" || !lastMessageAuthor) {
    authorName = null;
  } else if (isMyMessage) {
    authorName = "Вы:";
  } else if (isGroupLike) {
    const name = lastMessageAuthor.full_name ?? lastMessageAuthor.username;
    authorName = name ? `${name}:` : null;
  } else {
    // ЛС, чужое сообщение — имя не нужно (оно уже в displayName)
    authorName = null;
  }

  return (
    <Link
      href={href}
      onClick={() => onChatClickAction?.(chat)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenuAction?.(chat, e.clientX, e.clientY);
      }}
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        isActive
          ? "bg-(--accent-dim) border border-(--accent)"
          : "hover:bg-(--bg-primary) border border-transparent"
      }`}
    >
      {/* Аватар */}
      <div className="w-10 h-10 rounded-full bg-(--bg-primary) border border-(--border) flex items-center justify-center shrink-0 overflow-hidden">
        {chat.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={chat.avatar_url}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : chat.kind === "direct" && otherMember?.user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={otherMember.user.avatar_url}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : KindIcon ? (
          <KindIcon size={16} className="text-(--text-muted)" />
        ) : (
          <span className="text-sm font-medium text-(--text-muted)">
            {displayName.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>

      {/* Контент */}
      <div className="min-w-0 flex-1">
        {/* Заголовок: Имя + Время + Иконки статуса */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-medium text-(--text-primary) truncate">
            {displayName}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {chat.is_muted && (
              <BellOff size={12} className="text-(--text-muted)" />
            )}
            {chat.is_pinned && (
              <Pin size={12} className="text-(--text-muted)" />
            )}
            {chat.last_message && (
              <div className="text-[10px] text-(--text-muted)">
                <ClientOnly>
                  {formatChatListTime(chat.last_message.created_at)}
                </ClientOnly>
              </div>
            )}
          </div>
        </div>

        {/* Превью последнего сообщения */}
        {chat.last_message && (
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            {/* Автор: в группах — всегда, в ЛС — только "Вы:" */}
            {authorName && (
              <span
                className={`text-xs shrink-0 font-medium ${
                  isSystemMessage
                    ? "text-(--text-muted) opacity-70"
                    : "text-(--text-muted)"
                }`}
              >
                {authorName}
              </span>
            )}
            {/* Текст сообщения */}
            <span
              className={`text-xs truncate ${
                isSystemMessage
                  ? "text-(--text-muted) italic"
                  : "text-(--text-muted)"
              }`}
            >
              {chat.last_message.content}
            </span>
          </div>
        )}
      </div>

      {/* Badge непрочитанных */}
      {chat.unread_count > 0 &&
        (chat.is_muted ? (
          <div
            className="shrink-0 w-2.5 h-2.5 rounded-full bg-(--accent)"
            aria-label="Непрочитанные"
          />
        ) : (
          <div className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-(--accent) text-(--bg-card) text-[10px] font-semibold flex items-center justify-center">
            {chat.unread_count > 99 ? "99+" : chat.unread_count}
          </div>
        ))}
    </Link>
  );
}