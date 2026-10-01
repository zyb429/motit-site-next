"use client";

import {
  useState,
  useRef,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { openEditorModal } from "@rageshpikalmunde/rp-image-editor";
import { EmojiPickerButton } from "./EmojiPickerButton";
import { Send, Paperclip, X, CornerUpLeft, Pencil } from "lucide-react";
import type { ChatMessageItem } from "@/lib/db/chat";

type PendingFile = {
  file: File;
  previewUrl: string | null;
  isImage: boolean;
};

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
  onAttachAction?: (files: File[], content: string) => Promise<void>;
  disabled?: boolean;
  replyTo?: ChatMessageItem | null;
  onCancelReplyAction?: () => void;
  editing?: ChatMessageItem | null;
  onCancelEditAction?: () => void;
  onEditSubmitAction?: (messageUuid: string, content: string) => Promise<void>;
}) {
  const [text, setText] = useState(editing?.content ?? "");
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    onTypingAction?.();

    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }

  function addFiles(files: File[]) {
    const next: PendingFile[] = files.map((file) => ({
      file,
      isImage: file.type.startsWith("image/"),
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));
    setPending((prev) => [...prev, ...next]);
  }

  function removeFile(index: number) {
    setPending((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function replaceFile(index: number, newFile: File) {
    setPending((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      const next = [...prev];
      next[index] = {
        file: newFile,
        isImage: newFile.type.startsWith("image/"),
        previewUrl: newFile.type.startsWith("image/")
          ? URL.createObjectURL(newFile)
          : null,
      };
      return next;
    });
  }

  async function openImageEditor(index: number) {
    const target = pending[index];
    if (!target) return;

    const result = await openEditorModal({
      image: target.file,
      config: {
        exportFormat: "jpeg",
        exportQuality: 0.92,
        maxUndoSteps: 30,
        language: "en",
      },
    });

    if (result?.file) {
      replaceFile(index, result.file);
    }
  }

  async function handleSend() {
    const value = text.trim();
    const hasFiles = pending.length > 0;
    if ((!value && !hasFiles) || sending || disabled) return;

    setSending(true);
    try {
      if (editing) {
        await onEditSubmitAction?.(editing.uuid, value);
        onCancelEditAction?.();
        setText("");
      } else if (hasFiles) {
        await onAttachAction?.(pending.map((p) => p.file), value);
        pending.forEach((p) => {
          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        });
        setPending([]);
        setText("");
      } else {
        await onSendMessageAction(value);
        setText("");
      }
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
    if (e.key === "Escape" && editing) onCancelEditAction?.();
    if (e.key === "Escape" && replyTo) onCancelReplyAction?.();
  }

  return (
    <div className="shrink-0 p-3 border-t border-(--border) bg-(--bg-card)">
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

      {/* Pre-send превью вложений */}
      {pending.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {pending.map((p, i) => (
            <div key={i} className="relative group">
              {p.previewUrl ? (
                <button
                  type="button"
                  onClick={() => openImageEditor(i)}
                  className="block w-20 h-20 rounded-lg border border-(--border) overflow-hidden cursor-pointer"
                  title="Редактировать"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.previewUrl}
                    alt={p.file.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ) : (
                <div className="w-20 h-20 flex items-center justify-center rounded-lg border border-(--border) bg-(--bg-primary) p-1 text-center">
                  <span className="text-[10px] text-(--text-muted) break-all line-clamp-3">
                    📎 {p.file.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Убрать"
              >
                <X size={11} />
              </button>
            </div>
          ))}
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
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length) addFiles(files);
            }}
          />
        </label>

        {/* Эмодзи-пикер */}
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
          placeholder={
            editing
              ? "Редактировать…"
              : pending.length > 0
                ? "Подпись…"
                : "Написать сообщение…"
          }
          rows={1}
          disabled={disabled || sending}
          className="flex-1 px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-sm text-(--text-primary) focus:border-(--accent) outline-none resize-none max-h-48 disabled:opacity-50"
        />

        {/* Отправить */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && pending.length === 0) || sending || disabled}
          className="shrink-0 p-2 rounded-lg bg-(--accent) text-(--bg-card) hover:opacity-90 disabled:opacity-50 transition-opacity"
          title={editing ? "Сохранить (Enter)" : "Отправить (Enter)"}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
