// src/components/helpdesk/TicketThread.tsx
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Upload, X } from "lucide-react";

interface FileRecord {
  id: number;
  uuid: string;
  name: string | null;
  url: string;
  mime: string | null;
  size: number | null;
}

interface Attachment {
  uuid: string;
  files: FileRecord | null;
}

interface Comment {
  id: bigint | number;
  uuid: string;
  content: string;
  is_internal: boolean | null;
  created_at: Date | string | null;
  users: {
    id: number;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  attachments?: Attachment[];
}

interface UploadedFile {
  id: number;
  uuid: string;
  name: string;
  url: string;
  mime: string | null;
  size: number | null;
}

interface Props {
  ticketUuid: string;
  initialComments: Comment[];
  canPostInternal?: boolean;
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

export function TicketThread({
  ticketUuid,
  initialComments,
  canPostInternal = false,
}: Props) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const next = [...files, ...picked].slice(0, 5);
    setFiles(next);
    e.target.value = "";
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
        body: JSON.stringify({ content: text, isInternal, attachmentFileIds }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(typeof d.error === "string" ? d.error : "Не удалось отправить");
      }

      const data = await res.json();
      setComments((prev) => [...prev, data.data]);
      setText("");
      setIsInternal(false);
      setFiles([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSending(false);
      setUploading(false);
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-sm font-medium text-(--text-muted) uppercase tracking-wider">
        Переписка
      </h2>

      <ul className="space-y-3">
        {comments.length === 0 && (
          <li className="text-sm text-(--text-muted)">Сообщений пока нет</li>
        )}
        {comments.map((c) => (
          <li
            key={c.uuid}
            className={`p-4 rounded-xl border ${
              c.is_internal
                ? "bg-yellow-500/5 border-yellow-500/15"
                : "bg-(--bg-card) border-(--border)"
            }`}
          >
            <div className="flex items-center gap-3 text-xs text-(--text-muted)">
              <span className="font-medium text-(--text-primary)">
                {c.users?.full_name || c.users?.username || "—"}
              </span>
              <span>
                {c.created_at
                  ? new Date(c.created_at).toLocaleString("ru-RU")
                  : "—"}
              </span>
              {c.is_internal && (
                <span className="text-yellow-400">внутренняя заметка</span>
              )}
            </div>
            <div className="mt-2 text-(--text-secondary) whitespace-pre-wrap">
              {c.content}
            </div>

            {c.attachments && c.attachments.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {c.attachments.map((a) => {
                  const f = a.files;
                  if (!f) return null;
                  const isImage = f.mime?.startsWith("image/");
                  return (
                    <li key={a.uuid}>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--bg-primary) border border-(--border) text-xs text-(--text-secondary) hover:border-(--accent)/40"
                      >
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={f.url}
                            alt={f.name ?? "Файл"}
                            className="w-6 h-6 rounded object-cover"
                          />
                        ) : (
                          <Paperclip size={12} className="text-(--accent)" />
                        )}
                        <span className="truncate max-w-45 group-hover:text-(--accent)">
                          {f.name ?? "Файл"}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Ваше сообщение..."
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none resize-y"
        />

        {files.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <li
                key={i}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--bg-primary) border border-(--border) text-xs text-(--text-secondary)"
              >
                <Paperclip size={12} className="text-(--accent)" />
                <span className="truncate max-w-45">{f.name}</span>
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

        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-(--border) text-(--accent) text-sm cursor-pointer hover:bg-(--accent-dim)">
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

          {canPostInternal && (
            <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="accent-(--accent)"
              />
              Внутренняя заметка
            </label>
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={sending || uploading}
          className="px-5 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? "Загрузка файлов…" : sending ? "Отправка…" : "Отправить"}
        </button>
      </form>
    </div>
  );
}
