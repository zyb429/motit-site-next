"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Link as LinkIcon, ImageIcon, Pencil } from "lucide-react";

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
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Загружаем файл без принудительного переименования в .jpg
  const uploadFile = async (file: File | Blob, originalName?: string) => {
    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      // Если это File (не Blob), используем его оригинальное имя.
      // Иначе (Blob из редактора) даём имя с правильным расширением по MIME.
      const extFromMime: Record<string, string> = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
        "image/svg+xml": "svg",
        "image/gif": "gif",
      };
      const ext =
        (originalName && originalName.split(".").pop()) ||
        extFromMime[file.type] ||
        "png";
      const filename = originalName ?? `image.${ext}`;

      formData.append("files", file, filename);

      const res = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка загрузки");
      }

      const data = await res.json();
      const url = Array.isArray(data)
        ? data[0]?.url
        : data.url ?? data.file?.url;

      if (!url) throw new Error("API не вернул URL");
      setValue(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setIsUploading(false);
    }
  };

  // Редактор — только для растровых (jpg/webp), не для png/svg
  const processImage = async (fileOrUrl: File | string) => {
    try {
      setIsEditing(true);
      setError("");

      let file: File;
      let originalName: string | undefined;

      if (typeof fileOrUrl === "string") {
        const res = await fetch(fileOrUrl);
        if (!res.ok) throw new Error("Не удалось загрузить изображение");
        const blob = await res.blob();
        const extFromMime: Record<string, string> = {
          "image/png": "png",
          "image/jpeg": "jpg",
          "image/webp": "webp",
          "image/svg+xml": "svg",
          "image/gif": "gif",
        };
        const ext = extFromMime[blob.type] || "png";
        originalName = `image.${ext}`;
        file = new File([blob], originalName, {
          type: blob.type || "image/png",
        });
      } else {
        file = fileOrUrl;
        originalName = fileOrUrl.name;
      }

      // PNG и SVG не пускаем в редактор — он превратит их в JPEG и убьёт прозрачность
      const isPngOrSvg =
        file.type === "image/png" || file.type === "image/svg+xml";

      if (isPngOrSvg) {
        await uploadFile(file, originalName);
        return;
      }

      const { openEditorModal } = await import(
        "@rageshpikalmunde/rp-image-editor"
      );

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
      await uploadFile(result.file);
    } catch (err) {
      console.error("Image edit error:", err);
      setError(err instanceof Error ? err.message : "Ошибка редактора");
    } finally {
      setIsEditing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Пожалуйста, выберите изображение");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Файл слишком большой (максимум 5MB)");
      return;
    }

    if (inputRef.current) inputRef.current.value = "";
    await processImage(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-(--text-primary)">
        {label}
      </label>

      <div className="flex items-start gap-4">
        {/* Превью с ховер-эффектом */}
        <div className="relative shrink-0">
          {value ? (
            <button
              type="button"
              onClick={() => processImage(value)}
              disabled={isEditing || isUploading}
              title="Редактировать изображение"
              className="block cursor-pointer disabled:opacity-50 relative overflow-hidden rounded-lg border border-(--border) bg-(--bg-secondary) p-1 group"
            >
              <img
                src={value}
                alt={label}
                className="h-16 w-16 object-contain transition-opacity group-hover:opacity-50"
              />

              {/* Оверлей при наведении */}
              {!isEditing && !isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
              )}

              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isEditing || isUploading}
              title="Загрузить изображение"
              className="flex h-16 w-16 items-center justify-center rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-muted) hover:border-(--accent) hover:text-(--accent) transition-colors disabled:opacity-50"
            >
              <ImageIcon size={24} />
            </button>
          )}
        </div>

        <div className="flex-1 space-y-2">
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

          {mode === "upload" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading || isEditing}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-(--bg-secondary) text-sm border border-(--border) hover:border-(--accent) transition-colors disabled:opacity-50"
              >
                {isUploading || isEditing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isEditing
                  ? "Редактор..."
                  : isUploading
                    ? "Загрузка..."
                    : "Выбрать файл"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

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

          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              disabled={isEditing || isUploading}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 disabled:opacity-50"
            >
              <X className="w-3 h-3" /> Удалить
            </button>
          )}
        </div>
      </div>

      <input type="hidden" name={name} value={value} />
    </div>
  );
}