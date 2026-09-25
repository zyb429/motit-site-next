// src/components/chat/ChatListItem.tsx
"use client";

import Link from "next/link";
import { Users, Hash, Lock } from "lucide-react";
import type { ChatListItem as ChatListItemType } from "@/lib/db/chat";

function formatTime(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function preview(text: string, max = 50): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

export function ChatListItem({
  chat,
  currentUserUuid,
  href,
  isActive,
}: {
  chat: ChatListItemType;
  currentUserUuid: string;
  href: string;
  isActive: boolean;
}) {
  // Для direct-чата — имя собеседника
  const otherMember = chat.members.find((m) => m.user.uuid !== currentUserUuid);
  const displayName =
    chat.kind === "direct"
      ? otherMember?.user.full_name ?? otherMember?.user.username ?? "Без имени"
      : chat.name ?? "Без названия";

  // Иконка по типу чата (порядок важен: private_channel раньше channel)
  const KindIcon =
    chat.kind === "private_channel"
      ? Lock
      : chat.kind === "channel"
        ? Hash
        : chat.kind === "group"
          ? Users
          : null;

  return (
    <Link
      href={href}
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
        ) : otherMember?.user.avatar_url ? (
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

      {/* Текст */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-medium text-(--text-primary) truncate">
            {displayName}
          </div>
          {chat.last_message && (
            <div className="text-[10px] text-(--text-muted) shrink-0">
              {formatTime(chat.last_message.created_at)}
            </div>
          )}
        </div>
        {chat.last_message && (
          <div className="flex items-center gap-1 mt-0.5">
            {chat.last_message.user && (
              <span className="text-xs text-(--text-muted) shrink-0">
                {chat.last_message.user.uuid === currentUserUuid
                  ? "Вы:"
                  : `${chat.last_message.user.full_name?.split(" ")[0] ?? ""}:`}
              </span>
            )}
            <span className="text-xs text-(--text-muted) truncate">
              {chat.last_message.kind === "system" ||
              chat.last_message.kind === "status_change"
                ? chat.last_message.content
                : preview(chat.last_message.content)}
            </span>
          </div>
        )}
      </div>

      {/* Badge непрочитанных */}
      {chat.unread_count > 0 && !chat.is_muted && (
        <div className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-(--accent) text-(--bg-card) text-[10px] font-semibold flex items-center justify-center">
          {chat.unread_count > 99 ? "99+" : chat.unread_count}
        </div>
      )}
    </Link>
  );
}
