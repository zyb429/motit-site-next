// motit-site-next/src/components/account/EmailForm.tsx
"use client";

import { useState, type FormEvent } from "react";

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError("Введите корректный email");
      return;
    }
    if (!password) {
      setError("Введите текущий пароль");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/account/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail, password }),
    });
    setSaving(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Не удалось отправить письмо");
      return;
    }

    setMessage("Письмо отправлено на новый адрес. Перейдите по ссылке из письма.");
    setNewEmail("");
    setPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <Field label="Текущий email">
        <input
          type="email"
          value={currentEmail}
          disabled
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-secondary) opacity-60"
        />
      </Field>

      <Field label="Новый email">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          autoComplete="email"
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none transition-colors"
        />
      </Field>

      <Field label="Текущий пароль">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none transition-colors"
        />
      </Field>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {message && <p className="text-(--accent) text-sm">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "Отправка…" : "Сменить email"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-(--text-secondary) mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}