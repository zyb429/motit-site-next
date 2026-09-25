// src/components/chat/MessageInput.tsx
"use client";

import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { Send, Paperclip, X } from "lucide-react";

export function MessageInput({
  onSendMessageAction,
  onTypingAction,
  disabled,
}: {
  onSendMessageAction: (content: string) => Promise<void>;
  onTypingAction?: () => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    onTypingAction?.();

    // Авторасширение textarea
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }

  async function handleSend() {
    const value = text.trim();
    if (!value && files.length === 0) return;
    if (sending || disabled) return;

    setSending(true);
    try {
      // Если есть файлы — сначала загружаем их (упрощённо, без реального upload)
      // В реальном проекте: POST /api/upload → fileIds → onSendMessageAction(content, fileIds)
      await onSendMessageAction(value);
      setText("");
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
    e.target.value = "";
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="p-3 border-t border-(--border) bg-(--bg-card)">
      {/* Прикреплённые файлы */}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-(--bg-primary) border border-(--border) text-xs"
            >
              <Paperclip size={11} className="text-(--text-muted)" />
              <span className="text-(--text-primary) truncate max-w-37.5">
                {f.name}
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-(--text-muted) hover:text-red-400"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Кнопка вложения */}
        <label className="shrink-0 p-2 rounded-lg text-(--text-muted) hover:text-(--accent) hover:bg-(--bg-primary) transition-colors cursor-pointer">
          <Paperclip size={18} />
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || sending}
          />
        </label>

        {/* Поле ввода */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение…"
          rows={1}
          disabled={disabled || sending}
          className="flex-1 px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-sm text-(--text-primary) focus:border-(--accent) outline-none resize-none max-h-48 disabled:opacity-50"
        />

        {/* Кнопка отправки */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && files.length === 0) || sending || disabled}
          className="shrink-0 p-2 rounded-lg bg-(--accent) text-(--bg-card) hover:opacity-90 disabled:opacity-50 transition-opacity"
          title="Отправить (Enter)"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
