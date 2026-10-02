// src/components/chat/ChatContextMenu.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Pin,
  PinOff,
  Bell,
  BellOff,
  MailCheck,
  MailOpen,
  Trash2,
  LogOut,
} from "lucide-react";
import type { ChatListItem } from "@/lib/db/chat";
import { useFloatingPosition } from "@/hooks/useFloatingPosition";

export function ChatContextMenu({
  chat,
  x,
  y,
  onCloseAction,
  onPinAction,
  onMuteAction,
  onMarkUnreadAction,
  onMarkReadAction,
  onDeleteAction,
  onLeaveAction,
}: {
  chat: ChatListItem;
  x: number;
  y: number;
  onCloseAction: () => void;
  onPinAction: () => void;
  onMuteAction: () => void;
  onMarkUnreadAction: () => void;
  onMarkReadAction: () => void;
  onDeleteAction: (scope: "self" | "everyone") => void;
  onLeaveAction?: () => void;
}) {
  const { ref: menuRef, pos } = useFloatingPosition({ x, y });
  const [deleteSubmenu, setDeleteSubmenu] = useState(false);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCloseAction();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseAction();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onCloseAction, menuRef]);

  function run(fn: () => void) {
    fn();
    onCloseAction();
  }

  const isGroup =
    chat.kind === "group" ||
    chat.kind === "channel" ||
    chat.kind === "private_channel";

  const canDelete = chat.kind !== "saved";
  const canLeave = isGroup && chat.role !== "owner";
  const canDeleteForEveryone = isGroup && chat.role === "owner";

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-100 min-w-52 rounded-xl border border-(--border) bg-(--bg-card) shadow-2xl overflow-hidden"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="py-1">
        <MenuItem
          icon={chat.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
          label={chat.is_pinned ? "Открепить" : "Закрепить"}
          onClickAction={() => run(onPinAction)}
        />
        <MenuItem
          icon={chat.is_muted ? <Bell size={14} /> : <BellOff size={14} />}
          label={chat.is_muted ? "Включить уведомления" : "Отключить уведомления"}
          onClickAction={() => run(onMuteAction)}
        />
        {chat.unread_count > 0 ? (
          <MenuItem
            icon={<MailOpen size={14} />}
            label="Пометить как прочитанное"
            onClickAction={() => run(onMarkReadAction)}
          />
        ) : (
          <MenuItem
            icon={<MailCheck size={14} />}
            label="Пометить как непрочитанное"
            onClickAction={() => run(onMarkUnreadAction)}
          />
        )}

        {canDelete && (
          <>
            <MenuItem
              icon={<Trash2 size={14} />}
              label="Удалить чат"
              onClickAction={() => setDeleteSubmenu((v) => !v)}
              trailing={deleteSubmenu ? "▾" : "▸"}
              danger
            />
            {deleteSubmenu && (
              <div className="pl-3">
                <MenuItem
                  icon={<Trash2 size={12} />}
                  label="У себя"
                  onClickAction={() => run(() => onDeleteAction("self"))}
                  danger
                />
                {canDeleteForEveryone && (
                  <MenuItem
                    icon={<Trash2 size={12} />}
                    label="У всех"
                    onClickAction={() => run(() => onDeleteAction("everyone"))}
                    danger
                  />
                )}
              </div>
            )}
          </>
        )}

        {canLeave && onLeaveAction && (
          <MenuItem
            icon={<LogOut size={14} />}
            label="Покинуть чат"
            onClickAction={() => run(onLeaveAction)}
            danger
          />
        )}
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClickAction,
  danger,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  onClickAction: () => void;
  danger?: boolean;
  trailing?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClickAction}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-(--text-primary) hover:bg-(--bg-primary)"
      }`}
    >
      <span className={danger ? "text-red-400" : "text-(--text-muted)"}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {trailing && <span className="text-(--text-muted)">{trailing}</span>}
    </button>
  );
}
