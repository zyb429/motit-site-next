// src/components/chat/MessageContextMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Reply, Copy, Pencil, Trash2, Forward } from "lucide-react";
import { EmojiPickerButton } from "./EmojiPickerButton";

export type MessageContextMenuProps = {
  x: number;
  y: number;
  isOwn: boolean;
  onCloseAction: () => void;
  onReplyAction?: () => void;
  onCopyAction?: () => void;
  onEditAction?: () => void;
  onDeleteAction?: () => void;
  onReactAction?: (emoji: string) => void;
  onForwardAction?: () => void;
};

const QUICK_EMOJI = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export function MessageContextMenu({
  x,
  y,
  isOwn,
  onCloseAction,
  onReplyAction,
  onCopyAction,
  onEditAction,
  onDeleteAction,
  onReactAction,
  onForwardAction,
}: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjusted, setAdjusted] = useState({ x, y });

  // Подгоняем позицию, чтобы меню не вылезало за границы окна
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

  // Закрытие по клику вне и Escape
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

  function run(fn?: () => void) {
    fn?.();
    onCloseAction();
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-100 min-w-50 rounded-xl border border-(--border) bg-(--bg-card) shadow-2xl overflow-hidden"
      style={{ left: adjusted.x, top: adjusted.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Быстрые эмодзи */}
      {onReactAction && (
        <div className="flex items-center gap-0.5 px-2 py-2 border-b border-(--border)">
          {QUICK_EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => run(() => onReactAction(emoji))}
              className="w-8 h-8 rounded-lg hover:bg-(--bg-primary) text-lg flex items-center justify-center transition-colors"
              title={`Реакция: ${emoji}`}
            >
              {emoji}
            </button>
          ))}

          {/* ← Полный пикер вместо "more" */}
          <EmojiPickerButton
            variant="menu"
            onEmojiAction={(emoji) => run(() => onReactAction(emoji))}
          />
        </div>
      )}

      {/* Основные действия */}
      <div className="py-1">
        {onReplyAction && (
          <MenuItem
            icon={<Reply size={14} />}
            label="Ответить"
            onClickAction={() => run(onReplyAction)}
          />
        )}
        {onForwardAction && (
          <MenuItem
            icon={<Forward size={14} />}
            label="Переслать"
            onClickAction={() => run(onForwardAction)}
          />
        )}
        {onCopyAction && (
          <MenuItem
            icon={<Copy size={14} />}
            label="Копировать текст"
            onClickAction={() => run(onCopyAction)}
          />
        )}
        {isOwn && onEditAction && (
          <MenuItem
            icon={<Pencil size={14} />}
            label="Редактировать"
            onClickAction={() => run(onEditAction)}
          />
        )}
        {isOwn && onDeleteAction && (
          <MenuItem
            icon={<Trash2 size={14} />}
            label="Удалить"
            onClickAction={() => run(onDeleteAction)}
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
