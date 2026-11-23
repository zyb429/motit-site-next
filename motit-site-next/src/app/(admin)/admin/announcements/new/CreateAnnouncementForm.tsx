// src/app/(admin)/admin/announcements/new/CreateAnnouncementForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AUDIENCES = [
  { value: "all", label: "Все пользователи" },
  { value: "admin", label: "Только администраторы" },
  { value: "worker", label: "Только сотрудники" },
  { value: "client", label: "Только клиенты" },
  { value: "statistics", label: "Только статистика" },
];

export function CreateAnnouncementForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, audience }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Проверьте правильность заполнения полей";

        setError(message);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-(--text-primary)">
          Заголовок
        </label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          minLength={3}
          maxLength={200}
          required
          className="mt-1 w-full rounded-lg border border-(--border) bg-(--bg-primary) px-3 py-2 text-(--text-primary)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-(--text-primary)">
          Текст
        </label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          minLength={3}
          maxLength={2000}
          rows={5}
          required
          className="mt-1 w-full rounded-lg border border-(--border) bg-(--bg-primary) px-3 py-2 text-(--text-primary)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-(--text-primary)">
          Аудитория
        </label>
        <select
          value={audience}
          onChange={(event) => setAudience(event.target.value)}
          className="mt-1 w-full rounded-lg border border-(--border) bg-(--bg-primary) px-3 py-2 text-(--text-primary)"
        >
          {AUDIENCES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-(--accent) px-4 py-2 text-white disabled:opacity-60"
      >
        {saving ? "Сохранение..." : "Создать объявление"}
      </button>
    </form>
  );
}
