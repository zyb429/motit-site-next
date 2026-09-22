"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

type Role = {
  id: number;
  name: string;
  type: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  blocked: boolean;
  role: Role | null;
};

interface Props {
  user?: User;
  roles: Role[];
  onClose: () => void;
  onSaved: () => void;
}

export function UserModal({ user, roles, onClose, onSaved }: Props) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    full_name: user?.full_name ?? "",
    phone: user?.phone ?? "",
    password: "",
    roleId: user?.role?.id ?? "",
    blocked: user?.blocked ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = isEdit
        ? `/api/admin/users/${user!.id}`
        : "/api/admin/users";
      const method = isEdit ? "PATCH" : "POST";

      // Формируем payload — не отправляем пустые поля
      const payload: Record<string, unknown> = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        full_name: form.full_name.trim() || null,
        phone: form.phone.trim() || null,
      };

      if (form.password) {
        payload.password = form.password;
      }

      if (form.roleId) {
        payload.roleId = Number(form.roleId);
      }

      if (isEdit) {
        payload.blocked = form.blocked;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        className="bg-(--bg-card) rounded-xl border border-(--border) w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-(--border) sticky top-0 bg-(--bg-card) z-10">
          <h2 className="text-lg font-semibold text-(--text-primary)">
            {isEdit ? "Редактировать пользователя" : "Новый пользователь"}
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
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50"
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
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50"
              required
              disabled={saving}
            />
          </Field>

          <Field label="Полное имя">
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50"
              disabled={saving}
            />
          </Field>

          <Field label="Телефон">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50"
              disabled={saving}
              placeholder="+375 (29) 123-45-67"
            />
          </Field>

          <Field label={isEdit ? "Новый пароль (оставьте пустым)" : "Пароль"}>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50"
              minLength={6}
              required={!isEdit}
              disabled={saving}
              placeholder={isEdit ? "••••••" : "Минимум 6 символов"}
            />
          </Field>

          <Field label="Роль">
            <select
              value={String(form.roleId)}
              onChange={(e) =>
                setForm({ ...form, roleId: e.target.value })
              }
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50"
              disabled={saving}
            >
              <option value="">Без роли</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
              <input
                type="checkbox"
                checked={form.blocked}
                onChange={(e) =>
                  setForm({ ...form, blocked: e.target.checked })
                }
                disabled={saving}
              />
              Заблокирован
            </label>
          )}

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
