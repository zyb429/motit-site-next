// src/components/helpdesk/TicketReplyForm.tsx
"use client";

import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Upload, X, Lock, Loader2, Send } from "lucide-react";

interface UploadedFile {
  id: number;
  uuid: string;
  name: string;
  url: string;
  mime: string | null;
  size: number | null;
}

const ACCEPT = [
  "image/*",
  "text/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-rar-compressed",
  "application/gzip",
  "application/json",
  "application/xml",
].join(",");

interface Props {
  ticketUuid: string;
  canPostInternal?: boolean;
  canPostExternal?: boolean;
  onPostedAction?: () => void;
}

export function TicketReplyForm({
  ticketUuid,
  canPostInternal = false,
  canPostExternal = true,
  onPostedAction,
}: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(!canPostExternal);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
    e.target.value = "";
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (text.trim().length === 0) {
      setError("Сообщение не может быть пустым");
      return;
    }

    setSending(true);
    try {
      let attachmentFileIds: number[] = [];

      if (files.length > 0) {
        setUploading(true);
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        setUploading(false);

        if (!upRes.ok) {
          const d = await upRes.json().catch(() => ({}));
          throw new Error(d.error ?? "Не удалось загрузить файлы");
        }
        const uploaded: UploadedFile[] = await upRes.json();
        attachmentFileIds = uploaded.map((f) => f.id);
      }

      const res = await fetch(`/api/tickets/${ticketUuid}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          isInternal: canPostExternal ? isInternal : true,
          attachmentFileIds,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(
          typeof d.error === "string" ? d.error : "Не удалось отправить",
        );
      }

      setText("");
      setIsInternal(!canPostExternal);
      setFiles([]);
      onPostedAction?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSending(false);
      setUploading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 bg-(--bg-secondary) border border-(--border) rounded-xl text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-dim) outline-none transition-all text-sm resize-y";

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 space-y-3 p-4 sm:p-5 rounded-2xl border border-(--border) bg-(--bg-card) shadow-lg"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder={
          canPostExternal
            ? "Напишите сообщение..."
            : "Внутренняя заметка (клиент не увидит)..."
        }
        className={inputClass}
      />

      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--bg-secondary) border border-(--border) text-xs text-(--text-secondary)"
            >
              <Paperclip size={12} className="text-(--accent)" />
              <span className="truncate max-w-[160px]">{f.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-red-400 hover:text-red-300"
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-(--border) text-(--accent) text-sm cursor-pointer hover:bg-(--accent-dim) transition-colors">
          <Upload size={14} />
          Прикрепить
          <input
            type="file"
            multiple
            accept={ACCEPT}
            onChange={handleFileSelect}
            className="hidden"
            disabled={files.length >= 5}
          />
        </label>

        {canPostInternal && canPostExternal && (
          <label className="flex items-center gap-2 text-sm text-(--text-secondary) cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="accent-(--accent)"
            />
            Внутренняя заметка
          </label>
        )}

        {canPostInternal && !canPostExternal && (
          <span className="inline-flex items-center gap-2 text-sm text-yellow-400/80">
            <Lock size={13} />
            Только внутренние заметки
          </span>
        )}

        <div className="w-full sm:w-auto sm:ml-auto">
          <button
            type="submit"
            disabled={sending || uploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-(--accent) text-(--bg-primary) text-sm font-semibold hover:bg-(--accent-hover) disabled:opacity-50 transition-all shadow-sm"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Загрузка…
              </>
            ) : sending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Отправка…
              </>
            ) : (
              <>
                <Send size={16} /> Отправить
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
    </form>
  );
}