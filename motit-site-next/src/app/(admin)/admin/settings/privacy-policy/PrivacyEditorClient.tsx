// src/app/(admin)/admin/settings/privacy-policy/PrivacyEditorClient.tsx
"use client";

import { useState, useCallback, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  X,
  Loader2,
  History,
  ShieldCheck,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";
import type { JSONContent } from "@tiptap/core";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { PrivacyVersionsModal } from "./PrivacyVersionsModal";

type PrivacyMode = "page" | "document" | "file";

type PrivacyFile = { id: number; url: string; name: string };

function isValidTiptapDoc(input: unknown): input is JSONContent {
  return (
    !!input &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    (input as JSONContent).type === "doc" &&
    Array.isArray((input as JSONContent).content)
  );
}

export function PrivacyEditorClient({
  initialContent,
  initialMode,
  initialFile,
}: {
  initialContent: unknown;
  initialMode: PrivacyMode;
  initialFile: PrivacyFile | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialContentRef = useRef<JSONContent | null>(
    isValidTiptapDoc(initialContent) ? initialContent : null,
  );

  const [content, setContent] = useState<JSONContent | null>(
    initialContentRef.current,
  );
  const [mode, setMode] = useState<PrivacyMode>(initialMode);
  const [file, setFile] = useState<PrivacyFile | null>(initialFile);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;

      const allowed = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowed.includes(f.type)) {
        alert("Разрешены только PDF/DOC/DOCX");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (f.size > 20 * 1024 * 1024) {
        alert("Файл слишком большой (максимум 20MB)");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("files", f);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        // Читаем тело ошибки, чтобы показать реальную причину
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }

        const data = await res.json();
        const uploaded = Array.isArray(data) ? data[0] : data?.data?.[0] ?? data;
        if (!uploaded?.id || !uploaded?.url) {
          throw new Error("Некорректный ответ загрузки");
        }

        setFile({
          id: uploaded.id,
          url: uploaded.url,
          name: uploaded.name ?? f.name,
        });

        // Авто-переключение в режим "file" после загрузки
        setMode("file");
      } catch (err) {
        console.error(err);
        alert(
          err instanceof Error
            ? err.message
            : "Не удалось загрузить файл",
        );
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [],
  );

  const handleRemoveFile = useCallback(() => {
    setFile(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (mode === "file" && !file) {
      alert("Загрузите файл политики");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/privacy-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          displayMode: mode,
          fileId: mode === "file" ? file?.id : null,
          fileName: mode === "file" ? file?.name : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Ошибка: ${body.error ?? res.status}`);
        return;
      }
      alert("Сохранено");
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      console.error(e);
      alert("Сеть недоступна");
    } finally {
      setIsSaving(false);
    }
  }, [content, mode, file, router]);

  const handleRolledBack = useCallback(
    (next: { content: JSONContent | null; displayMode: PrivacyMode }) => {
      setContent(next.content);
      setMode(next.displayMode);
      startTransition(() => {
        router.refresh();
      });
    },
    [router],
  );

  const isDisabled = isSaving || isPending || isUploading;

  const modeLabel =
    mode === "file"
      ? "Режим: файл"
      : mode === "document"
        ? "Режим: документ"
        : "Режим: страница";

  return (
    <div className="flex flex-col h-full bg-(--bg-primary) overflow-hidden">
      <header className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-2 sm:py-3 border-b border-(--border) bg-(--bg-primary)/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link
            href="/admin/settings"
            className="text-(--text-muted) hover:text-(--text-primary) transition-colors p-2 rounded-full hover:bg-(--bg-secondary) shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-(--accent)" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-(--text-primary) truncate">
              Политика конфиденциальности
            </h1>
            <p className="text-xs text-(--text-muted) truncate">{modeLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setVersionsOpen(true)}
            disabled={isDisabled}
            className="px-2 sm:px-4 py-2 text-sm text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) rounded-md transition-colors flex items-center gap-1 sm:gap-2"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">История</span>
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isDisabled}
            className="px-2 sm:px-4 py-2 text-sm text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) rounded-md transition-colors"
          >
            <span className="hidden sm:inline">Отмена</span>
            <X className="w-4 h-4 sm:hidden" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isDisabled}
            className="px-3 sm:px-5 py-2 bg-(--accent) text-(--bg-primary) rounded-md hover:bg-(--accent-hover) disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 sm:gap-2 shadow-sm font-medium text-sm"
          >
            {isSaving || isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Сохранение...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Сохранить</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-(--bg-primary) overflow-y-auto">
          <div className="w-full px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-4 sm:gap-6 min-h-full">
            <div className="rounded-xl border border-(--border) bg-(--bg-card) p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-(--text-muted) mb-3">
                Режим отображения
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ModeOption
                  value="page"
                  current={mode}
                  onSelect={setMode}
                  title="Как страница"
                  desc="Страница /privacy-policy с шапкой и футером сайта"
                  disabled={isDisabled}
                />
                <ModeOption
                  value="document"
                  current={mode}
                  onSelect={setMode}
                  title="Как документ"
                  desc="Минимальная /privacy-policy/document без навигации"
                  disabled={isDisabled}
                />
                <ModeOption
                  value="file"
                  current={mode}
                  onSelect={setMode}
                  title="Файл"
                  desc="Загрузить PDF/DOCX — на странице будет ссылка на скачивание"
                  disabled={isDisabled}
                />
              </div>
            </div>

            {mode === "file" ? (
              <div className="rounded-xl border border-(--border) bg-(--bg-card) p-4 flex flex-col gap-4">
                <div className="text-sm font-medium text-(--text-primary)">
                  Файл политики
                </div>

                {file ? (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-(--border) bg-(--bg-secondary)">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-(--accent) shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm text-(--text-primary) truncate">
                          {file.name}
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-(--accent) hover:underline truncate block"
                        >
                          Открыть
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={isDisabled}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                      aria-label="Удалить файл"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-(--border) hover:border-(--accent) transition-colors cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileUpload}
                      disabled={isDisabled}
                      className="hidden"
                    />
                    {isUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-(--accent)" />
                        <span className="text-sm text-(--text-secondary)">
                          Загрузка...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-(--accent)" />
                        <span className="text-sm text-(--text-primary)">
                          Загрузить файл
                        </span>
                        <span className="text-xs text-(--text-muted)">
                          PDF, DOC, DOCX · до 20MB
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col relative overflow-hidden rounded-xl border border-(--border) transition-colors focus-within:border-(--accent) bg-(--bg-primary)">
                <SimpleEditor
                  initialContent={initialContentRef.current}
                  onChange={(json) => setContent(json)}
                  editable={!isDisabled}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {versionsOpen && (
        <PrivacyVersionsModal
          open={versionsOpen}
          onClose={() => setVersionsOpen(false)}
          onRolledBack={handleRolledBack}
          currentMode={mode}
        />
      )}
    </div>
  );
}

function ModeOption({
  value,
  current,
  onSelect,
  title,
  desc,
  disabled,
}: {
  value: PrivacyMode;
  current: PrivacyMode;
  onSelect: (v: PrivacyMode) => void;
  title: string;
  desc: string;
  disabled?: boolean;
}) {
  const checked = current === value;
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        checked
          ? "border-(--accent) bg-(--accent-dim)"
          : "border-(--border) hover:border-(--border-hover)"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="radio"
        name="displayMode"
        checked={checked}
        onChange={() => onSelect(value)}
        disabled={disabled}
        className="mt-1 accent-(--accent)"
      />
      <div>
        <div className="text-sm font-medium text-(--text-primary)">{title}</div>
        <div className="text-xs text-(--text-muted) mt-0.5">{desc}</div>
      </div>
    </label>
  );
}