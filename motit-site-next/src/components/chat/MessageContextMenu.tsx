// src/components/chat/MessageContextMenu.tsx
"use client";

import { useEffect, useState } from "react";
import { Reply, Copy, Pencil, Trash2, Forward, Pin } from "lucide-react";
import { EmojiPickerButton } from "./EmojiPickerButton";
import { useFloatingPosition } from "@/hooks/useFloatingPosition";

export type MessageContextMenuProps = {
  x: number;
  y: number;
  isOwn: boolean;
  onCloseAction: () => void;
  onReplyAction?: () => void;
  onCopyAction?: () => void;
  onEditAction?: () => void;
  onDeleteAction?: (scope: "self" | "everyone") => void;
  onReactAction?: (emoji: string) => void;
  onForwardAction?: () => void;
  onPinAction?: (scope: "self" | "everyone") => void;
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
  onPinAction,
}: MessageContextMenuProps) {
  const { ref: menuRef, pos } = useFloatingPosition({ x, y });
  const [pinSubmenu, setPinSubmenu] = useState(false);
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

  function run(fn?: () => void) {
    fn?.();
    onCloseAction();
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-100 min-w-50 rounded-xl border border-(--border) bg-(--bg-card) shadow-2xl overflow-hidden"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
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

          <EmojiPickerButton
            variant="menu"
            onEmojiAction={(emoji) => run(() => onReactAction(emoji))}
          />
        </div>
      )}

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

        {onPinAction && (
          <>
            <MenuItem
              icon={<Pin size={14} />}
              label="Закрепить"
              onClickAction={() => setPinSubmenu((v) => !v)}
              trailing={pinSubmenu ? "▾" : "▸"}
            />
            {pinSubmenu && (
              <div className="pl-3">
                <MenuItem
                  icon={<Pin size={12} />}
                  label="Для себя"
                  onClickAction={() => run(() => onPinAction("self"))}
                />
                <MenuItem
                  icon={<Pin size={12} />}
                  label="Для всех"
                  onClickAction={() => run(() => onPinAction("everyone"))}
                />
              </div>
            )}
          </>
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

        {onDeleteAction && (
          <>
            <MenuItem
              icon={<Trash2 size={14} />}
              label="Удалить"
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
                {isOwn && (
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
