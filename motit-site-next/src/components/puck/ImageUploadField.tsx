"use client";

import { useState } from "react";
import type { CustomField } from "@puckeditor/core";

// было: CustomField<string | null>
export const imageUploadField: CustomField<string | null | undefined> = {
  type: "custom",
  label: "Логотип",
  render: ({ value, onChange }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = async (file: File) => {
      if (!file.type.startsWith("image/")) { setError("Нужно изображение"); return; }
      if (file.size > 1 * 1024 * 1024) { setError("Максимум 1MB"); return; }
      setUploading(true); setError(null);
      try {
        const fd = new FormData();
        fd.append("files", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const uploaded = Array.isArray(json) ? json[0] : json?.data?.[0];
        if (!uploaded?.url) throw new Error("Нет URL");
        onChange(uploaded.url);        // string — ок для string | null | undefined
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка");
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="space-y-2">
        {value ? (
          <div className="relative inline-block group">
            <img src={value} alt="" className="h-12 w-auto rounded border" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
            >✕</button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500">
            {uploading ? <span>Загрузка…</span> : <span>Загрузить SVG или PNG</span>}
            <input
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
};