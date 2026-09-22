// src/components/admin/EditUserModal.tsx
"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { PasswordInput } from "../ui/PasswordInput";

type User = {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  blocked?: boolean;
};

interface Props {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}

export function EditUserModal({ user, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    full_name: user.full_name ?? "",
    phone: user.phone ?? "",
  });
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {...form};

      if (password.trim()) {
        if (password.trim().length < 8) {
          throw new Error("Пароль должен быть не короче 8 символов");
        }
        payload.password = password.trim();
      }

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка сохранения");
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-(--bg-card) rounded-xl border border-(--border) w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-(--border)">
          <h2 className="text-lg font-semibold text-(--text-primary)">
            Редактировать пользователя
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary)"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <Field label="Username">
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none"
              required
              minLength={3}
              disabled={saving}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none"
              required
              disabled={saving}
            />
          </Field>

          <Field label="Полное имя">
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none"
              disabled={saving}
            />
          </Field>

          <Field label="Телефон">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none"
              disabled={saving}
            />
          </Field>

          {/* Разделитель */}
          <div className="border-t border-(--border) pt-3 mt-1">
            <p className="text-xs text-(--text-muted) mb-3">
              Оставьте пустым, чтобы не менять пароль
            </p>

            <Field label="Новый пароль">
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Минимум 6 символов"
                minLength={6}
                autoComplete="new-password"
                disabled={saving}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm text-(--text-secondary) hover:bg-(--bg-secondary) disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm bg-(--accent) text-(--bg-primary) font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
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
    <label className="block">
      <span className="block text-xs font-medium text-(--text-muted) mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
