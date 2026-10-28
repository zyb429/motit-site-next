"use client";

import { useState } from "react";
import type { CustomField } from "@puckeditor/core";

export type CertificateFileValue =
  | {
      url: string;
      fileId?: number;
      name?: string;
    }
  | string
  | null;

function normalize(v: CertificateFileValue) {
  if (!v) return { url: "", fileId: undefined, name: undefined };
  if (typeof v === "string") return { url: v, fileId: undefined, name: undefined };
  return v;
}

const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024;

function FileInput({
  value,
  onChange,
  folder,
}: {
  value: CertificateFileValue;
  onChange: (v: CertificateFileValue) => void;
  folder: string;
}) {
  const current = normalize(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      setError("Допустимы PDF, JPG, PNG, WEBP");
      input.value = "";
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Максимум 20 МБ");
      input.value = "";
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);

      const data: { url: string; fileId: number; name: string } = await res.json();
      onChange({ url: data.url, fileId: data.fileId, name: data.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  return (
    <div className="space-y-3 text-sm">
      {current.url ? (
        <div className="flex items-center gap-3">
          <a
            href={current.url}
            target="_blank"
            rel="noreferrer"
            className="underline truncate max-w-[260px]"
            title={current.url}
          >
            {current.name || current.url}
          </a>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-red-600 text-sm px-2 py-1"
          >
            Удалить
          </button>
        </div>
      ) : (
        <span className="text-gray-500">Файл не загружен</span>
      )}

      <label className="flex items-center justify-between gap-4 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-4 cursor-pointer hover:border-teal-400 hover:bg-teal-50/40 transition-colors">
        <span className="text-sm text-gray-600">
          {uploading
            ? "Загрузка…"
            : current.url
              ? "Заменить файл (PDF, JPG, PNG, WEBP)"
              : "Выберите файл (PDF, JPG, PNG, WEBP)"}
        </span>
        <span className="text-sm font-medium text-teal-600 whitespace-nowrap">
          Обзор…
        </span>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={handleFile}
          className="sr-only"
        />
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}

function makeFileField(
  label: string,
  folder: string
): CustomField<CertificateFileValue> {
  return {
    type: "custom",
    label,
    render: ({ value, onChange }) => (
      <FileInput
        value={value as CertificateFileValue}
        onChange={(v) => onChange(v)}
        folder={folder}
      />
    ),
  };
}

export const certificateFileField = makeFileField(
  "Файл сертификата (PDF или изображение)",
  "certificates"
);

export const policyFileField = makeFileField(
  "Файл политики (PDF или изображение)",
  "policies"
);