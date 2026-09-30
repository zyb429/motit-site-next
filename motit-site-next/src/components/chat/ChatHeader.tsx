// src/components/chat/ChatHeader.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Users,
  Hash,
  Lock,
  MoreVertical,
  Bookmark,
  UserPlus,
  BellOff,
  LogOut,
  Trash2,
  Settings,
  Info,
} from "lucide-react";

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
  onSettingsAction?: () => void;
  onAddMembersAction?: () => void;
  onToggleMuteAction?: () => void;
  onLeaveAction?: () => void;
  onDeleteAction?: () => void;
  onInfoAction?: () => void;
};

export function ChatHeader({
  chat,
  currentUserUuid,
  isOnlineAction,
  onSettingsAction,
  onAddMembersAction,
  onToggleMuteAction,
  onLeaveAction,
  onDeleteAction,
  onInfoAction,
}: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне меню и по Escape
  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  // Saved Messages — особый вид, без меню
  if (chat.kind === "saved") {
    return (
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-(--border) bg-(--bg-card)">
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

  const otherMember = chat.members.find(
    (m) => m.user.uuid !== currentUserUuid,
  );

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

  const onlineCount = chat.members.filter((m) =>
    isOnlineAction?.(m.user.uuid),
  ).length;

  const isDirectOnline =
    chat.kind === "direct" && otherMember
      ? isOnlineAction?.(otherMember.user.uuid) ?? false
      : false;

  // Что показывать в меню — зависит от типа чата
  const canAddMembers =
    chat.kind === "group" || chat.kind === "private_channel";
  const canLeave = chat.kind !== "direct" && chat.kind !== "saved";
  const canDelete = chat.kind !== "direct" && chat.kind !== "saved";

  const hasMenuItems =
    onInfoAction ||
    onSettingsAction ||
    (canAddMembers && onAddMembersAction) ||
    onToggleMuteAction ||
    (canLeave && onLeaveAction) ||
    (canDelete && onDeleteAction);

  return (
    <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-(--border) bg-(--bg-card)">
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

      {/* Меню на 3 точки */}
      {hasMenuItems && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-(--bg-primary) text-(--text-muted) hover:text-(--text-primary) transition-colors"
            title="Настройки чата"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 z-50 min-w-56 py-1 rounded-lg bg-(--bg-card) border border-(--border) shadow-lg"
            >
              {onInfoAction && (
                <MenuItem
                  icon={<Info size={15} />}
                  label="Информация о чате"
                  onClick={() => {
                    setMenuOpen(false);
                    onInfoAction();
                  }}
                />
              )}

              {onSettingsAction && (
                <MenuItem
                  icon={<Settings size={15} />}
                  label="Настройки чата"
                  onClick={() => {
                    setMenuOpen(false);
                    onSettingsAction();
                  }}
                />
              )}

              {canAddMembers && onAddMembersAction && (
                <MenuItem
                  icon={<UserPlus size={15} />}
                  label="Добавить участников"
                  onClick={() => {
                    setMenuOpen(false);
                    onAddMembersAction();
                  }}
                />
              )}

              {onToggleMuteAction && (
                <MenuItem
                  icon={<BellOff size={15} />}
                  label="Отключить уведомления"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleMuteAction();
                  }}
                />
              )}

              {(canLeave && onLeaveAction) || (canDelete && onDeleteAction) ? (
                <div className="my-1 border-t border-(--border)" />
              ) : null}

              {canLeave && onLeaveAction && (
                <MenuItem
                  icon={<LogOut size={15} />}
                  label="Покинуть чат"
                  danger
                  onClick={() => {
                    setMenuOpen(false);
                    onLeaveAction();
                  }}
                />
              )}

              {canDelete && onDeleteAction && (
                <MenuItem
                  icon={<Trash2 size={15} />}
                  label="Удалить чат"
                  danger
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteAction();
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-(--text-secondary) hover:bg-(--bg-primary) hover:text-(--text-primary)"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
