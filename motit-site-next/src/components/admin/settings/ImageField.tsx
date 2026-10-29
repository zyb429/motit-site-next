"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Link as LinkIcon } from "lucide-react";

export function ImageField({
  name,
  label,
  defaultValue,
  accept = "image/*",
  uploadEndpoint = "/api/upload",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  accept?: string;
  uploadEndpoint?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [mode, setMode] = useState<"url" | "upload">(
    defaultValue ? "url" : "upload",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "branding");

      const res = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка загрузки");
      }

      const data = await res.json();
      const url = data.url ?? data.file?.url;
      if (!url) throw new Error("API не вернул URL");
      setValue(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-(--text-primary)">
        {label}
      </label>

      <div className="flex items-start gap-4">
        {/* Превью */}
        <div className="w-20 h-20 rounded-lg border border-(--border) bg-(--bg-secondary) flex items-center justify-center overflow-hidden shrink-0">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={label}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-xs text-(--text-muted)">Нет</span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {/* Переключатель режимов */}
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`px-2 py-1 rounded flex items-center gap-1 ${
                mode === "upload"
                  ? "bg-(--accent) text-white"
                  : "bg-(--bg-secondary) text-(--text-muted)"
              }`}
            >
              <Upload className="w-3 h-3" /> Файл
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`px-2 py-1 rounded flex items-center gap-1 ${
                mode === "url"
                  ? "bg-(--accent) text-white"
                  : "bg-(--bg-secondary) text-(--text-muted)"
              }`}
            >
              <LinkIcon className="w-3 h-3" /> Ссылка
            </button>
          </div>

          {/* Загрузка файла */}
          {mode === "upload" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-(--bg-secondary) text-sm border border-(--border) hover:border-(--accent) transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploading ? "Загрузка..." : "Выбрать файл"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFile}
                className="hidden"
              />
            </div>
          )}

          {/* Ввод URL */}
          {mode === "url" && (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://... или /files/..."
              className="w-full rounded-lg px-3 py-2 text-sm bg-(--bg-primary) text-(--text-primary) border border-(--border) focus:border-(--accent) outline-none font-mono"
            />
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Кнопка удаления */}
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Удалить
            </button>
          )}
        </div>
      </div>

      {/* Скрытое поле для формы */}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}