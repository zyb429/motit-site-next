"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload, X, AlertCircle } from "lucide-react";
import { updateSocialOptions } from "@/app/(admin)/admin/settings/actions";

type Option = { label: string; value: string; icon?: string };

const inputCls =
  "px-3 py-2 rounded border border-(--border) bg-(--bg-primary) text-(--text-primary) text-sm";

const RESERVED_VALUE = "__custom__";

function extractUploadUrl(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;

  const obj = json as Record<string, unknown>;

  // [{ url }]
  if (Array.isArray(json)) {
    const first = json[0] as Record<string, unknown> | undefined;
    if (first && typeof first.url === "string") return first.url;
    return null;
  }

  // { data: [{ url }] }
  const data = (obj.data as unknown) ?? null;
  if (Array.isArray(data)) {
    const first = data[0] as Record<string, unknown> | undefined;
    if (first && typeof first.url === "string") return first.url;
  }

  // { url }
  if (typeof obj.url === "string") return obj.url;

  return null;
}

export function SocialOptionsForm({
  siteId,
  initial,
}: {
  siteId: number;
  initial: Option[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<Option[]>(initial);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [uploading, setUploading] = useState<number | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const uploadIcon = async (file: File, target: { idx: number } | "new") => {
    setError(null);
    setUploading(target === "new" ? "new" : target.idx);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const url = extractUploadUrl(json);
      if (!url) throw new Error("Сервер не вернул URL файла");

      if (target === "new") {
        setNewIcon(url);
      } else {
        setItems((prev) =>
          prev.map((it, i) => (i === target.idx ? { ...it, icon: url } : it)),
        );
      }
    } catch (e) {
      console.error("[uploadIcon]", e);
      setError(e instanceof Error ? e.message : "Не удалось загрузить иконку");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedValue = newValue.trim();
    const trimmedLabel = newLabel.trim();

    if (trimmedValue === RESERVED_VALUE) {
      setError(`Ключ «${RESERVED_VALUE}» зарезервирован`);
      return;
    }

    const fd = new FormData();
    fd.append("id", String(siteId));
    fd.append("items", JSON.stringify(items));

    if (trimmedLabel && trimmedValue) {
      fd.append(
        "newItem",
        JSON.stringify({
          label: trimmedLabel,
          value: trimmedValue,
          icon: newIcon.trim() || undefined,
        }),
      );
    }

    startTransition(async () => {
      const result = await updateSocialOptions(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setNewLabel("");
      setNewValue("");
      setNewIcon("");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-(--border) p-4"
    >
      <input type="hidden" name="id" value={siteId} />

      {error && (
        <div className="flex items-start gap-2 rounded border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-(--text-muted)">
          Дополнительных сетей нет. Добавьте, чтобы они появились в редакторе.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((o, idx) => (
            <div key={idx} className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                <input
                  value={o.label}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((it, i) =>
                        i === idx ? { ...it, label: e.target.value } : it,
                      ),
                    )
                  }
                  placeholder="Название (например, Дзен)"
                  className={inputCls}
                />
                <input
                  value={o.value}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((it, i) =>
                        i === idx ? { ...it, value: e.target.value } : it,
                      ),
                    )
                  }
                  placeholder="Ключ (например, dzen)"
                  className={`${inputCls} font-mono`}
                />
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded border border-(--border) text-sm text-(--text-primary) cursor-pointer hover:border-(--accent)">
                  <Upload size={14} />
                  {uploading === idx
                    ? "Загрузка…"
                    : o.icon
                      ? "Заменить"
                      : "Иконка"}
                  <input
                    type="file"
                    accept="image/svg+xml,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadIcon(f, { idx });
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="px-2 py-2 rounded border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10"
                  aria-label="Удалить"
                >
                  <X size={14} />
                </button>
              </div>
              {o.icon && (
                <div className="flex items-center gap-2 text-xs text-(--text-muted) pl-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.icon} alt="" className="h-6 w-6 object-contain" />
                  <span className="font-mono break-all">{o.icon}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 pt-3 border-t border-(--border)">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Новая сеть: название"
          className={inputCls}
        />
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Новая сеть: ключ"
          className={`${inputCls} font-mono`}
        />
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded border border-(--border) text-sm text-(--text-primary) cursor-pointer hover:border-(--accent)">
          <Upload size={14} />
          {uploading === "new" ? "Загрузка…" : newIcon ? "Заменить" : "Иконка"}
          <input
            type="file"
            accept="image/svg+xml,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadIcon(f, "new");
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {newIcon && (
        <div className="flex items-center gap-2 text-xs text-(--text-muted)">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={newIcon} alt="" className="h-6 w-6 object-contain" />
          <span className="font-mono break-all">{newIcon}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending || uploading !== null}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--accent) text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        <Plus size={14} />
        {pending ? "Сохранение…" : "Сохранить"}
      </button>
    </form>
  );
}
