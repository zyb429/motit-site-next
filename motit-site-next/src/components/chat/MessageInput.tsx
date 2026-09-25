// src/components/chat/MessageInput.tsx
"use client";

import {
  useState,
  useRef,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { EmojiPickerButton } from "./EmojiPickerButton";
import { Send, Paperclip, X, CornerUpLeft, Pencil } from "lucide-react";
import type { ChatMessageItem } from "@/lib/db/chat";

export function MessageInput({
  onSendMessageAction,
  onTypingAction,
  onAttachAction,
  disabled,
  replyTo,
  onCancelReplyAction,
  editing,
  onCancelEditAction,
  onEditSubmitAction,
}: {
  onSendMessageAction: (content: string) => Promise<void>;
  onTypingAction?: () => void;
  onAttachAction?: (files: File[]) => Promise<void>;
  disabled?: boolean;
  replyTo?: ChatMessageItem | null;
  onCancelReplyAction?: () => void;
  editing?: ChatMessageItem | null;
  onCancelEditAction?: () => void;
  onEditSubmitAction?: (messageUuid: string, content: string) => Promise<void>;
}) {
  const [text, setText] = useState(editing?.content ?? "");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    onTypingAction?.();

    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }

  async function handleSend() {
    const value = text.trim();
    if (!value || sending || disabled) return;

    setSending(true);
    try {
      if (editing) {
        await onEditSubmitAction?.(editing.uuid, value);
        onCancelEditAction?.();
      } else {
        await onSendMessageAction(value);
      }
      setText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape" && editing) {
      onCancelEditAction?.();
    }
    if (e.key === "Escape" && replyTo) {
      onCancelReplyAction?.();
    }
  }

  return (
    <div className="p-3 border-t border-(--border) bg-(--bg-card)">
      {/* Reply preview */}
      {replyTo && !editing && (
        <div className="mb-2 flex items-start gap-2 px-2 py-1.5 rounded-lg bg-(--bg-primary) border-l-2 border-(--accent)">
          <CornerUpLeft size={14} className="text-(--accent) shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-(--text-muted)">
              Ответ{" "}
              {replyTo.user?.full_name ?? replyTo.user?.username ?? "—"}
            </div>
            <div className="text-xs text-(--text-primary) truncate">
              {replyTo.content.slice(0, 100)}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReplyAction}
            className="text-(--text-muted) hover:text-red-400 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editing preview */}
      {editing && (
        <div className="mb-2 flex items-start gap-2 px-2 py-1.5 rounded-lg bg-(--bg-primary) border-l-2 border-yellow-500">
          <Pencil size={14} className="text-yellow-500 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-(--text-muted)">
              Редактирование
            </div>
            <div className="text-xs text-(--text-primary) truncate">
              {editing.content.slice(0, 100)}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelEditAction}
            className="text-(--text-muted) hover:text-red-400 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Скрепка (вложения) */}
        <label className="shrink-0 p-2 rounded-lg text-(--text-muted) hover:text-(--accent) hover:bg-(--bg-primary) transition-colors cursor-pointer">
          <Paperclip size={18} />
          <input
            type="file"
            multiple
            className="hidden"
            disabled={disabled || sending}
              onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length === 0) return;
              setSending(true);
              try {
                await onAttachAction?.(files);
              } finally {
                setSending(false);
              }
            }}
          />
        </label>

        {/* ← Эмодзи-пикер */}
        <EmojiPickerButton
          onEmojiAction={(emoji) => {
            setText((prev) => prev + emoji);
            textareaRef.current?.focus();
          }}
        />

        {/* Поле ввода */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={editing ? "Редактировать…" : "Написать сообщение…"}
          rows={1}
          disabled={disabled || sending}
          className="flex-1 px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-sm text-(--text-primary) focus:border-(--accent) outline-none resize-none max-h-48 disabled:opacity-50"
        />

        {/* Отправить */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          className="shrink-0 p-2 rounded-lg bg-(--accent) text-(--bg-card) hover:opacity-90 disabled:opacity-50 transition-opacity"
          title={editing ? "Сохранить (Enter)" : "Отправить (Enter)"}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
