"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

type Organization = {
  uuid: string;
  name: string;
  inn: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
};

interface Props {
  organization?: Organization;
  onClose: () => void;
  onSaved: () => void;
}

export function OrganizationModal({ organization, onClose, onSaved }: Props) {
  const isEdit = !!organization;
  const [form, setForm] = useState({
    name: organization?.name ?? "",
    inn: organization?.inn ?? "",
    email: organization?.email ?? "",
    phone: organization?.phone ?? "",
    address: organization?.address ?? "",
    is_active: organization?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = isEdit
        ? `/api/admin/organizations/${organization!.uuid}`
        : "/api/admin/organizations";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
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
            {isEdit ? "Редактировать организацию" : "Новая организация"}
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

          <Field label="Название">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50"
              required
              minLength={2}
              disabled={saving}
            />
          </Field>

          <Field label="ИНН">
            <input
              type="text"
              value={form.inn}
              onChange={(e) => setForm({ ...form, inn: e.target.value })}
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50"
              disabled={saving}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            />
          </Field>

          <Field label="Адрес">
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50 resize-none"
              disabled={saving}
              placeholder="г. Минск, ул. Примерная, 1"
            />
          </Field>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                disabled={saving}
              />
              Активна
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
