// src/components/chat/ChatHeader.tsx
"use client";

import { Users, Hash, Lock, MoreVertical, Bookmark } from "lucide-react";

type ChatHeaderProps = {
  chat: {
    uuid: string;
    kind: string;
    name: string | null;
    members: Array<{
      uuid: string;
      user: {
        uuid: string;
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
      };
    }>;
  };
  currentUserUuid: string;
  isOnlineAction?: (userUuid: string) => boolean;
};

export function ChatHeader({
  chat,
  currentUserUuid,
  isOnlineAction,
}: ChatHeaderProps) {
  // Saved Messages — особый вид
  if (chat.kind === "saved") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border-b border-(--border) bg-(--bg-card)">
        <div className="w-9 h-9 rounded-full bg-(--accent-dim) flex items-center justify-center shrink-0">
          <Bookmark size={18} className="text-(--accent)" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-(--text-primary)">
            Saved Messages
          </div>
          <div className="text-xs text-(--text-muted)">только вы</div>
        </div>
      </div>
    );
  }

  const otherMember = chat.members.find((m) => m.user.uuid !== currentUserUuid);

  const displayName =
    chat.kind === "direct"
      ? otherMember?.user.full_name ?? otherMember?.user.username ?? "Без имени"
      : chat.name ?? "Без названия";

  const KindIcon =
    chat.kind === "private_channel"
      ? Lock
      : chat.kind === "channel"
        ? Hash
        : chat.kind === "group"
          ? Users
          : null;

  const onlineCount = chat.members.filter((m) =>
    isOnlineAction?.(m.user.uuid),
  ).length;
  const isDirectOnline =
    chat.kind === "direct" && otherMember
      ? isOnlineAction?.(otherMember.user.uuid) ?? false
      : false;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-(--border) bg-(--bg-card)">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-(--bg-primary) border border-(--border) flex items-center justify-center shrink-0 overflow-hidden relative">
          {otherMember?.user.avatar_url ? (
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
          {isDirectOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-(--bg-card)" />
          )}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium text-(--text-primary) truncate">
            {displayName}
          </div>
          <div className="text-xs text-(--text-muted)">
            {chat.kind === "direct" ? (
              isDirectOnline ? (
                <span className="text-green-500">онлайн</span>
              ) : (
                "не в сети"
              )
            ) : (
              <>
                {chat.members.length}{" "}
                {chat.members.length === 1
                  ? "участник"
                  : chat.members.length < 5
                    ? "участника"
                    : "участников"}
                {onlineCount > 0 && (
                  <span className="text-green-500">
                    {" "}
                    · {onlineCount} онлайн
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="p-2 rounded-lg hover:bg-(--bg-primary) text-(--text-muted) hover:text-(--text-primary) transition-colors"
        title="Настройки чата"
      >
        <MoreVertical size={16} />
      </button>
    </div>
  );
}
