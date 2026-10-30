"use client";

import { useState } from "react";

type MimeOption = { group: string; mime: string; label: string };

export function UploadMimeForm({
  allOptions,
  initial,
}: {
  allOptions: MimeOption[];
  initial: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (mime: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(mime)) next.delete(mime);
      else next.add(mime);
      return next;
    });
  };

  const toggleGroup = (group: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const o of allOptions) {
        if (o.group !== group) continue;
        if (on) next.add(o.mime);
        else next.delete(o.mime);
      }
      return next;
    });
  };

  const save = async () => {
    setPending(true);
    setOk(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings/upload", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mime: Array.from(selected) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : `HTTP ${res.status}`,
        );
      }
      setOk(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setPending(false);
    }
  };

  const groups = Array.from(new Set(allOptions.map((o) => o.group)));

  return (
    <div className="space-y-6">
      <p className="text-sm text-(--text-muted)">
        Отметьте типы файлов, которые можно загружать через админку. Для иконок
        соцсетей нужен <code>image/svg+xml</code>.
      </p>

      {groups.map((group) => {
        const options = allOptions.filter((o) => o.group === group);
        const allOn = options.every((o) => selected.has(o.mime));
        return (
          <div key={group} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-(--text-primary)">
                {group}
              </h3>
              <label className="flex items-center gap-2 text-xs text-(--text-muted) cursor-pointer">
                <input
                  type="checkbox"
                  checked={allOn}
                  onChange={(e) => toggleGroup(group, e.target.checked)}
                  className="h-4 w-4"
                />
                Все
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {options.map((o) => (
                <label
                  key={o.mime}
                  className="flex items-center gap-2 px-3 py-2 rounded border border-(--border) text-sm text-(--text-primary) cursor-pointer hover:border-(--accent)"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(o.mime)}
                    onChange={() => toggle(o.mime)}
                    className="h-4 w-4"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-3 pt-2 border-t border-(--border)">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="px-4 py-2 rounded-lg bg-(--accent) text-white font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {pending ? "Сохранение…" : "Сохранить"}
        </button>
        {ok && <span className="text-green-500 text-sm">Сохранено</span>}
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
    </div>
  );
}
