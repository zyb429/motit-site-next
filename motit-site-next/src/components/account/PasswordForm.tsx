// src/components/account/PasswordForm.tsx
"use client";

import { useState, type FormEvent } from "react";
import { signOut } from "next-auth/react";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (next.length < 8) {
      setError("Пароль должен быть не короче 8 символов");
      return;
    }
    if (next !== confirm) {
      setError("Пароли не совпадают");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Не удалось сменить пароль");
      return;
    }

    setMessage("Пароль изменён. Выходим…");
    setTimeout(() => signOut({ callbackUrl: "/login" }), 1200);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <Field label="Текущий пароль">
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none transition-colors"
        />
      </Field>

      <Field label="Новый пароль">
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none transition-colors"
        />
      </Field>

      <Field label="Повторите новый пароль">
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
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
        {saving ? "Сохранение…" : "Сменить пароль"}
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
