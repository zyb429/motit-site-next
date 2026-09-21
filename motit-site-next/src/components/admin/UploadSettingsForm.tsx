// src/components/admin/UploadSettingsForm.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface MimeOption {
  group: string;
  mime: string;
  label: string;
}

interface Props {
  allOptions: MimeOption[];
  initialAllowed: string[];
}

export function UploadSettingsForm({ allOptions, initialAllowed }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<Set<string>>(new Set(initialAllowed));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Группируем MIME по категориям
  const grouped = useMemo(() => {
    const map = new Map<string, MimeOption[]>();
    for (const opt of allOptions) {
      if (!map.has(opt.group)) map.set(opt.group, []);
      map.get(opt.group)!.push(opt);
    }
    return Array.from(map.entries());
  }, [allOptions]);

  function toggle(mime: string) {
    setAllowed((prev) => {
      const next = new Set(prev);
      if (next.has(mime)) next.delete(mime);
      else next.add(mime);
      return next;
    });
  }

  function toggleGroup(group: string, on: boolean) {
    const items = grouped.find(([g]) => g === group)?.[1] ?? [];
    setAllowed((prev) => {
      const next = new Set(prev);
      for (const item of items) {
        if (on) next.add(item.mime);
        else next.delete(item.mime);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings/upload", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mime: Array.from(allowed) }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(typeof d.error === "string" ? d.error : "Не удалось сохранить");
      }
      setMessage("Сохранено");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {grouped.map(([group, items]) => {
        const allChecked = items.every((i) => allowed.has(i.mime));
        return (
          <div
            key={group}
            className="p-4 rounded-xl bg-(--bg-card) border border-(--border)"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-(--text-primary)">{group}</h2>
              <button
                type="button"
                onClick={() => toggleGroup(group, !allChecked)}
                className="text-xs text-(--accent) hover:underline"
              >
                {allChecked ? "Снять все" : "Выбрать все"}
              </button>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {items.map((item) => (
                <label
                  key={item.mime}
                  className="flex items-center gap-2 text-sm text-(--text-secondary) cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={allowed.has(item.mime)}
                    onChange={() => toggle(item.mime)}
                    className="accent-(--accent)"
                  />
                  {item.label}
                  <span className="text-[10px] text-(--text-muted)">
                    {item.mime}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {message && <p className="text-(--accent) text-sm">{message}</p>}

      <button
        type="submit"
        disabled={saving || allowed.size === 0}
        className="px-6 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Сохранение…" : "Сохранить"}
      </button>

      {allowed.size === 0 && (
        <p className="text-yellow-400 text-sm">
          Нельзя сохранить пустой список — выберите хотя бы один тип
        </p>
      )}
    </form>
  );
}
