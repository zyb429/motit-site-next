"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { Paperclip, Lock, X, Send, Loader2, FileText, Play, Music } from "lucide-react";

// Импортируем компоненты из чатов
import { MediaPreviewModal, type PreviewFile } from "@/components/chat/MediaPreviewModal";
import { LinkPreview } from "@/components/chat/LinkPreview";

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

export interface Comment {
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

interface Props {
  ticketUuid?: string;
  initialComments?: Comment[];
  comments?: Comment[];
  title?: string;
  canPostInternal?: boolean;
  canPostExternal?: boolean;
  children?: ReactNode;
}

type LocalFile = File & { previewUrl?: string };

export function TicketThread({
  ticketUuid,
  initialComments,
  comments,
  title = "Переписка",
  canPostInternal = false,
  canPostExternal = false,
  children,
}: Props) {
  const safeInitial = Array.isArray(initialComments)
    ? initialComments
    : Array.isArray(comments)
      ? comments
      : [];

  const [items, setItems] = useState<Comment[]>(safeInitial);

  // --- СОСТОЯНИЕ ДЛЯ ПРЕВЬЮ ФАЙЛОВ (как в ChatView) ---
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);

  // Состояние формы
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояние для файлов
  const [selectedFiles, setSelectedFiles] = useState<LocalFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canPost = canPostInternal || canPostExternal;
  const safeItems = Array.isArray(items) ? items : [];
  const hasContent = text.trim().length > 0 || selectedFiles.length > 0;

  // Автоматическая высота textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [text]);

  const addFiles = (files: File[]) => {
    const newFiles = files.map((file) => {
      const localFile = file as LocalFile;
      if (file.type.startsWith("image/")) {
        localFile.previewUrl = URL.createObjectURL(file);
      }
      return localFile;
    });
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const clipboardItems = e.clipboardData.items;
    const files: File[] = [];
    
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].kind === "file") {
        const file = clipboardItems[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      addFiles(files);
    }
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => {
      const fileToRemove = prev[index];
      if (fileToRemove.previewUrl) URL.revokeObjectURL(fileToRemove.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // --- ЛОГИКА ОТКРЫТИЯ ПРЕВЬЮ ФАЙЛОВ ---
  const openPreview = (file: FileRecord, allFiles: FileRecord[]) => {
    // Конвертируем FileRecord в PreviewFile
    const mappedFiles: PreviewFile[] = allFiles.map((f) => ({
      id: f.id, // Обязательно передаем id
      uuid: f.uuid,
      name: f.name || "Файл",
      url: f.url,
      mime: f.mime,
      size: f.size,
      kind: "attachment", // Помечаем как вложение
    }));

    const idx = mappedFiles.findIndex((f) => f.uuid === file.uuid);
    setPreviewFiles(mappedFiles);
    setPreviewIndex(idx >= 0 ? idx : 0);
  };

  const closePreview = () => {
    setPreviewIndex(-1);
    setPreviewFiles([]);
  };

  const navigatePreview = (index: number) => {
    setPreviewIndex(index);
  };

  // --- РЕДАКТОР ИЗОБРАЖЕНИЙ ---
  async function handleEditImage(index: number) {
    const file = selectedFiles[index];
    if (!file || !file.type.startsWith("image/") || !file.previewUrl) return;

    try {
      const { openEditorModal } = await import("@rageshpikalmunde/rp-image-editor");

      const result = await openEditorModal({
        image: file,
        config: {
          exportFormat: "jpeg",
          exportQuality: 0.92,
          maxUndoSteps: 30,
          language: "en",
        },
      });

      if (!result?.file) return;

      const newFile = new File([result.file], file.name, { type: result.file.type }) as LocalFile;
      newFile.previewUrl = URL.createObjectURL(result.file);

      setSelectedFiles((prev) => {
        const newArr = [...prev];
        if (newArr[index].previewUrl) {
          URL.revokeObjectURL(newArr[index].previewUrl!);
        }
        newArr[index] = newFile;
        return newArr;
      });
    } catch (err) {
      console.error("Editor error:", err);
      alert(err instanceof Error ? err.message : "Не удалось отредактировать изображение");
    }
  }

  async function handleSend() {
    if (!ticketUuid || !hasContent || sending) return;
    setSending(true);
    setError(null);

    try {
      const uploadedFileIds: number[] = [];
      
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || "Ошибка загрузки файлов");
        }
        
        const uploadedFiles = await uploadRes.json(); 
        
        if (Array.isArray(uploadedFiles)) {
          uploadedFiles.forEach((f: any) => {
             if (f.id) uploadedFileIds.push(f.id);
          });
        }
      }

      const res = await fetch(`/api/tickets/${ticketUuid}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text.trim(),
          isInternal: isInternal, 
          attachmentFileIds: uploadedFileIds,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const errorMsg = Array.isArray(d.error) ? d.error[0]?.message : d.error;
        throw new Error(typeof errorMsg === "string" ? errorMsg : "Не удалось отправить");
      }

      const data = await res.json();
      const created: Comment | undefined = data?.data;
      if (created) setItems((prev) => [...prev, created]);
      
      setText("");
      selectedFiles.forEach(f => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      setSelectedFiles([]);
      
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setTimeout(() => textareaRef.current?.focus(), 50);

    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка отправки");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-(--text-primary)">{title}</h2>
        <span className="text-xs text-(--text-muted)">
          {safeItems.length} {safeItems.length === 1 ? "сообщение" : "сообщений"}
        </span>
      </div>

      {/* Лента комментариев */}
      <ul className="space-y-3">
        {safeItems.length === 0 && (
          <li className="text-sm text-(--text-muted) text-center py-10 bg-(--bg-card)/50 rounded-2xl border border-dashed border-(--border)">
            Сообщений пока нет. Напишите первым!
          </li>
        )}

        {safeItems.map((c) => {
          const authorName = c.users?.full_name || c.users?.username || "Пользователь";
          const initial = authorName.charAt(0).toUpperCase();
          const isInternalMsg = Boolean(c.is_internal);

          // Собираем все файлы из этого комментария для галереи
          const commentFiles = (c.attachments ?? [])
            .map((a) => a.files)
            .filter((f): f is FileRecord => f !== null);

          // Определяем, есть ли в тексте ссылка (для рендера превью)
          const hasLink = /(https?:\/\/|www\.)/i.test(c.content);

          return (
            <li
              key={c.uuid}
              className={`relative flex gap-3 p-4 rounded-2xl transition-colors ${
                isInternalMsg
                  ? "bg-amber-500/5 border border-amber-500/20"
                  : "bg-(--bg-card) border border-(--border)"
              }`}
            >
              <div className="shrink-0">
                {c.users?.avatar_url ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-(--bg-secondary) ring-2 ring-(--bg-card)">
                    <Image src={c.users.avatar_url} alt={authorName} fill className="object-cover" sizes="40px" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-(--accent-dim) flex items-center justify-center text-(--accent) font-semibold text-sm ring-2 ring-(--bg-card)">
                    {initial}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                  <span className="text-sm font-semibold text-(--text-primary)">{authorName}</span>
                  <span className="text-xs text-(--text-muted)">
                    {c.created_at ? new Date(c.created_at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </span>
                  {isInternalMsg && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-semibold text-[10px] uppercase tracking-wide ml-auto">
                      <Lock size={10} strokeWidth={2.5} />
                      Внутренняя
                    </span>
                  )}
                </div>

                {/* Текст сообщения */}
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isInternalMsg ? "text-amber-100/90" : "text-(--text-secondary)"}`}>
                  {c.content}
                </div>

                {/* Превью ссылки (если есть ссылка в тексте) */}
                {hasLink && (
                  <LinkPreview text={c.content} />
                )}

                {commentFiles.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {commentFiles.map((f) => {
                      const isImage = f.mime?.startsWith("image/");
                      const isVideo = f.mime?.startsWith("video/");
                      const isAudio = f.mime?.startsWith("audio/");

                      return (
                        <li key={f.uuid}>
                          <button
                            type="button"
                            onClick={() => {
                              // ВСЕГДА открываем в MediaPreviewModal, 
                              // он сам разберется: картинка, видео, PDF или скачивание
                              openPreview(f, commentFiles);
                            }}
                            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--bg-secondary) border border-(--border) text-xs font-medium text-(--text-secondary) hover:border-(--accent)/50 hover:text-(--accent) transition-all"
                          >
                            {isImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={f.url} alt={f.name ?? "Файл"} className="w-8 h-8 rounded object-cover" />
                            ) : isVideo ? (
                              <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-(--accent)">
                                <Play size={14} fill="currentColor" />
                              </div>
                            ) : isAudio ? (
                              <div className="w-8 h-8 rounded bg-(--accent-dim) flex items-center justify-center text-(--accent)">
                                <Music size={14} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded bg-(--bg-secondary) flex items-center justify-center">
                                <Paperclip size={14} className="text-(--accent)" />
                              </div>
                            )}
                            <span className="truncate max-w-[180px]">{f.name ?? "Файл"}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Форма ответа */}
      {canPost && ticketUuid && (
        <div className="rounded-2xl bg-(--bg-card) border border-(--border) shadow-sm overflow-hidden focus-within:border-(--accent)/50 focus-within:ring-1 focus-within:ring-(--accent)/20 transition-all">
          
          {/* Превью выбранных файлов */}
          {selectedFiles.length > 0 && (
            <div className="px-3 pt-3 pb-2 flex flex-wrap gap-2 border-b border-(--border)/50 bg-(--bg-secondary)/30">
              {selectedFiles.map((file, idx) => {
                const isImage = file.type.startsWith("image/");
                return (
                  <div 
                    key={idx} 
                    className="relative group w-16 h-16 rounded-xl bg-(--bg-card) border border-(--border) overflow-hidden flex items-center justify-center shrink-0 shadow-sm"
                  >
                    {isImage && file.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleEditImage(idx)}
                        title="Нажмите, чтобы отредактировать"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-1 text-center w-full h-full">
                        <FileText size={20} className="text-(--text-muted) mb-1" />
                        <span className="text-[9px] text-(--text-muted) truncate w-full px-1" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-2 sm:p-3">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              placeholder={isInternal ? "Внутренняя заметка (клиент не увидит)…" : "Написать сообщение…"}
              rows={1}
              className="w-full resize-none px-2 py-1.5 bg-transparent border-0 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:ring-0 outline-none leading-relaxed max-h-[200px] overflow-y-auto"
              style={{ minHeight: "40px" }}
            />

            {error && <div className="mt-1 text-xs font-medium text-red-400 px-2">{error}</div>}

            <div className="flex items-end justify-between gap-2 mt-2 pt-2 border-t border-(--border)/50">
              <div className="flex items-center gap-1 pb-1">
                <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="p-2 rounded-xl text-(--text-muted) hover:bg-(--bg-secondary) hover:text-(--accent) transition-colors disabled:opacity-50"
                  title="Прикрепить файл"
                >
                  <Paperclip size={20} />
                </button>

                {canPostInternal && (
                  <button
                    type="button"
                    onClick={() => setIsInternal((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isInternal 
                        ? "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30" 
                        : "text-(--text-muted) hover:bg-(--bg-secondary) hover:text-(--text-primary)"
                    }`}
                    title="Внутренняя заметка — клиент не увидит"
                  >
                    <Lock size={14} strokeWidth={2.5} />
                    <span className="hidden sm:inline">{isInternal ? "Внутренняя" : "Заметка"}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !hasContent}
                className={`flex items-center justify-center gap-2 transition-all shadow-sm ${
                  hasContent
                    ? "px-5 py-2.5 rounded-xl bg-(--accent) text-white text-sm font-semibold hover:opacity-90" 
                    : "w-10 h-10 rounded-full bg-(--bg-secondary) text-(--text-muted) opacity-50 cursor-not-allowed"
                }`}
              >
                {sending ? (
                  <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
                ) : hasContent ? (
                  <>
                    <span className="hidden sm:inline">Отправить</span>
                    <Send size={16} strokeWidth={2.5} />
                  </>
                ) : (
                  <Send size={18} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {children}

      {/* --- МЕДИА-ПРОСМОТРЩИК (ИЗ ЧАТОВ) --- */}
      {previewIndex >= 0 && previewFiles[previewIndex] && (
        <MediaPreviewModal
          file={previewFiles[previewIndex]}
          siblings={previewFiles}
          currentIndex={previewIndex}
          onCloseAction={closePreview}
          onNavigateAction={navigatePreview}
        />
      )}
    </div>
  );
}