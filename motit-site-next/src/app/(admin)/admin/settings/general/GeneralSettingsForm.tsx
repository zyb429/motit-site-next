// src/app/(admin)/admin/settings/general/GeneralSettingsForm.tsx
"use client";

import { useState, useTransition, type SyntheticEvent } from "react";
import { Save, Loader2 } from "lucide-react";

const FIELDS = [
  {
    key: "site_name",
    label: "Название сайта",
    placeholder: "Motit",
    type: "text" as const,
  },
  {
    key: "site_description",
    label: "Описание",
    placeholder: "IT-решения для бизнеса",
    type: "text" as const,
  },
  {
    key: "site_keywords",
    label: "Ключевые слова (через запятую)",
    placeholder: "IT, безопасность, аудит",
    type: "text" as const,
  },
  {
    key: "site_language",
    label: "Язык",
    placeholder: "ru",
    type: "text" as const,
  },
  {
    key: "site_timezone",
    label: "Часовой пояс",
    placeholder: "Europe/Minsk",
    type: "text" as const,
  },
  {
    key: "site_url",
    label: "URL сайта",
    placeholder: "https://motit.by",
    type: "text" as const,
  },
];

export function GeneralSettingsForm({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: values }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Ошибка сохранения");
        }

        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка");
      }
    });
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent) focus:outline-none transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-(--bg-card) rounded-xl border border-(--border) p-6 space-y-4"
    >
      {FIELDS.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-(--text-primary) mb-1">
            {label}
          </label>
          <input
            type="text"
            value={values[key] ?? ""}
            onChange={(e) => handleChange(key, e.target.value)}
            disabled={isPending}
            placeholder={placeholder}
            className={inputClass}
          />
        </div>
      ))}

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
          {error}
        </p>
      )}

      {success && (
        <p className="text-(--accent) text-sm bg-(--accent-dim) border border-(--accent)/20 p-3 rounded-lg">
          Настройки сохранены
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-(--accent) text-(--bg-primary) rounded-lg hover:bg-(--accent-hover) disabled:opacity-50 flex items-center gap-2 transition-colors font-medium"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Сохранить
            </>
          )}
        </button>
      </div>
    </form>
  );
}
