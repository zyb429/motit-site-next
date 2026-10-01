// src/components/chat/ChatContextMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Pin,
  PinOff,
  Bell,
  BellOff,
  MailCheck,
  Trash2,
  LogOut,
} from "lucide-react";
import type { ChatListItem } from "@/lib/db/chat";

export function ChatContextMenu({
  chat,
  x,
  y,
  onCloseAction,
  onPinAction,
  onMuteAction,
  onMarkUnreadAction,
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
  onDeleteAction: () => void;
  onLeaveAction?: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjusted, setAdjusted] = useState({ x, y });

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const rect = menu.getBoundingClientRect();
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    let nx = x;
    let ny = y;
    if (x + rect.width > winW - 8) nx = winW - rect.width - 8;
    if (y + rect.height > winH - 8) ny = winH - rect.height - 8;
    if (nx < 8) nx = 8;
    if (ny < 8) ny = 8;
    setAdjusted({ x: nx, y: ny });
  }, [x, y]);

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
  }, [onCloseAction]);

  function run(fn: () => void) {
    fn();
    onCloseAction();
  }

  const isGroup =
    chat.kind === "group" ||
    chat.kind === "channel" ||
    chat.kind === "private_channel";

  const canDelete = isGroup && chat.role === "owner";
  const canLeave = isGroup && chat.role !== "owner";

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-100 min-w-52 rounded-xl border border-(--border) bg-(--bg-card) shadow-2xl overflow-hidden"
      style={{ left: adjusted.x, top: adjusted.y }}
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
        <MenuItem
          icon={<MailCheck size={14} />}
          label="Отметить как непрочитанное"
          onClickAction={() => run(onMarkUnreadAction)}
        />
        {canDelete && (
          <MenuItem
            icon={<Trash2 size={14} />}
            label="Удалить чат"
            onClickAction={() => run(onDeleteAction)}
            danger
          />
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
}: {
  icon: React.ReactNode;
  label: string;
  onClickAction: () => void;
  danger?: boolean;
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
      <span>{label}</span>
    </button>
  );
}
