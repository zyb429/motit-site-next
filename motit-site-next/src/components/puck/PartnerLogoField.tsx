"use client";

import { useRef, useState } from "react";
import { ImageIcon, Upload, Trash2 } from "lucide-react";
import { openEditorModal } from "@rageshpikalmunde/rp-image-editor";
import type { CustomField } from "@puckeditor/core";

export const partnerLogoField: CustomField<string> = {
  type: "custom",
  label: "Логотип",
  render: ({ value, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (file: File | Blob) => {
      setUploading(true);
      setError(null);
      try {
        const fd = new FormData();
        fd.append("files", file, "logo.png");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const uploaded = Array.isArray(json) ? json[0] : json?.data?.[0];
        if (!uploaded?.url) throw new Error("Нет URL");
        onChange(uploaded.url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка");
      } finally {
        setUploading(false);
      }
    };

    // Клик по превью → открыть редактор для текущего логотипа
    const openEditorForValue = async () => {
      if (!value || editing || uploading) return;
      try {
        setEditing(true);
        setError(null);
        const res = await fetch(value);
        if (!res.ok) throw new Error("Не удалось загрузить изображение");
        const blob = await res.blob();
        const file = new File([blob], "logo.png", {
          type: blob.type || "image/png",
        });

        const result = await openEditorModal({
          image: file,
          config: {
            exportFormat: "png",
            exportQuality: 0.92,
            maxUndoSteps: 30,
            language: "en",
          },
        });

        if (!result?.file) return;
        await uploadFile(result.file);
      } catch (err) {
        console.error("Logo edit error:", err);
        setError(err instanceof Error ? err.message : "Не удалось отредактировать");
      } finally {
        setEditing(false);
      }
    };

    // «Загрузить» → выбор файла → сразу открыть редактор
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Нужно изображение");
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Максимум 5MB");
        e.target.value = "";
        return;
      }
      e.target.value = "";

      try {
        setEditing(true);
        setError(null);
        const result = await openEditorModal({
          image: file,
          config: {
            exportFormat: "png",
            exportQuality: 0.92,
            maxUndoSteps: 30,
            language: "en",
          },
        });
        if (!result?.file) return;
        await uploadFile(result.file);
      } catch (err) {
        console.error("Logo edit error:", err);
        setError(err instanceof Error ? err.message : "Не удалось отредактировать");
      } finally {
        setEditing(false);
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          {/* Превью — клик открывает редактор, если логотип есть */}
          <div className="relative shrink-0">
            {value ? (
              <button
                type="button"
                onClick={openEditorForValue}
                disabled={editing || uploading}
                title="Редактировать изображение"
                className="block cursor-pointer disabled:opacity-50"
              >
                <img
                  src={value}
                  alt=""
                  className="h-16 w-16 rounded border bg-white object-contain p-1 hover:border-blue-500 transition-colors"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={editing || uploading}
                title="Загрузить изображение"
                className="flex h-16 w-16 items-center justify-center rounded border bg-gray-50 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50"
              >
                <ImageIcon size={24} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={editing || uploading}
              className="inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              <Upload size={12} />
              {editing ? "Редактор…" : uploading ? "Загрузка…" : "Загрузить"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={editing || uploading}
                className="inline-flex items-center gap-1.5 rounded border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={12} />
                Удалить
              </button>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={editing || uploading}
          className="hidden"
        />

        <input
          className="w-full rounded border p-2 text-sm"
          placeholder="/images/partners/partner_1.png или https://..."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
};