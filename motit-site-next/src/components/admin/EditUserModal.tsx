// src/components/admin/EditUserModal.tsx
"use client";

import { useState } from "react";
import { Loader2, X, Star, Trash2 } from "lucide-react";
import { PasswordInput } from "../ui/PasswordInput";

type UserOrganization = {
  uuid: string;
  name: string;
  inn: string | null;
  role_in_company: string;
  is_primary: boolean;
  is_active: boolean;
};

type OrganizationOption = {
  uuid: string;
  name: string;
  inn: string | null;
};

type User = {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  blocked?: boolean;
  organizations?: UserOrganization[];
};

interface Props {
  user: User;
  allOrganizations: OrganizationOption[];
  onClose: () => void;
  onSaved: () => void;
}

export function EditUserModal({
  user,
  allOrganizations,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    full_name: user.full_name ?? "",
    phone: user.phone ?? "",
  });
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Организации
  const [organizations, setOrganizations] = useState<UserOrganization[]>(
    user.organizations ?? [],
  );
  const [orgError, setOrgError] = useState<string | null>(null);
  const [orgBusy, setOrgBusy] = useState<string | null>(null);
  const [addingOrgUuid, setAddingOrgUuid] = useState("");
  const [addingRole, setAddingRole] = useState("member");
  const [addingPrimary, setAddingPrimary] = useState(false);

  const availableOrganizations = allOrganizations.filter(
    (o) => !organizations.some((uo) => uo.uuid === o.uuid),
  );

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { ...form };

      if (password.trim()) {
        if (password.trim().length < 8) {
          throw new Error("Пароль должен быть не короче 8 символов");
        }
        payload.password = password.trim();
      }

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
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

  const addOrganization = async () => {
    if (!addingOrgUuid) return;
    setOrgError(null);
    setOrgBusy("__add__");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationUuid: addingOrgUuid,
          roleInCompany: addingRole,
          isPrimary: addingPrimary,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Ошибка привязки");

      if (data.link.is_primary) {
        setOrganizations((prev) =>
          prev.map((o) => ({ ...o, is_primary: false })),
        );
      }
      setOrganizations((prev) => [...prev, data.link]);
      setAddingOrgUuid("");
      setAddingRole("member");
      setAddingPrimary(false);
    } catch (e) {
      setOrgError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setOrgBusy(null);
    }
  };

  const removeOrganization = async (orgUuid: string, name: string) => {
    if (!confirm(`Отвязать организацию «${name}»?`)) return;
    setOrgError(null);
    setOrgBusy(orgUuid);
    try {
      const res = await fetch(
        `/api/admin/users/${user.id}/organizations/${orgUuid}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка отвязки");
      }
      setOrganizations((prev) => prev.filter((o) => o.uuid !== orgUuid));
    } catch (e) {
      setOrgError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setOrgBusy(null);
    }
  };

  const makePrimary = async (orgUuid: string) => {
    setOrgError(null);
    setOrgBusy(orgUuid);
    try {
      const res = await fetch(
        `/api/admin/users/${user.id}/organizations/${orgUuid}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPrimary: true }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка");
      }
      setOrganizations((prev) =>
        prev.map((o) => ({ ...o, is_primary: o.uuid === orgUuid })),
      );
    } catch (e) {
      setOrgError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setOrgBusy(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-(--bg-card) rounded-xl border border-(--border) w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-(--border) shrink-0">
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

        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-3 overflow-y-auto flex-1"
        >
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
            />
          </Field>

          {/* Пароль */}
          <div className="border-t border-(--border) pt-3 mt-1">
            <p className="text-xs text-(--text-muted) mb-3">
              Оставьте пустым, чтобы не менять пароль
            </p>
            <Field label="Новый пароль">
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Минимум 8 символов"
                minLength={8}
                autoComplete="new-password"
                disabled={saving}
              />
            </Field>
          </div>

          {/* Организации */}
          <div className="border-t border-(--border) pt-3 mt-1">
            <p className="text-xs font-medium text-(--text-muted) mb-2">
              Организации
            </p>

            {orgError && (
              <div className="mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                {orgError}
              </div>
            )}

            {organizations.length > 0 ? (
              <ul className="space-y-1 mb-3">
                {organizations.map((org) => (
                  <li
                    key={org.uuid}
                    className="flex items-center justify-between gap-2 text-sm px-2 py-1.5 rounded-lg bg-(--bg-secondary) border border-(--border)"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-(--text-primary) truncate">
                        {org.name}
                      </div>
                      <div className="text-xs text-(--text-muted)">
                        {org.role_in_company}
                        {org.is_primary && " · основная"}
                        {!org.is_active && " · неактивна"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!org.is_primary && (
                        <button
                          type="button"
                          onClick={() => makePrimary(org.uuid)}
                          disabled={orgBusy === org.uuid}
                          title="Сделать основной"
                          aria-label="Сделать основной"
                          className="p-1.5 rounded text-(--text-muted) hover:text-(--accent) hover:bg-(--accent-dim) disabled:opacity-50"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeOrganization(org.uuid, org.name)}
                        disabled={orgBusy === org.uuid}
                        title="Отвязать"
                        aria-label="Отвязать"
                        className="p-1.5 rounded text-(--text-muted) hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-(--text-muted) mb-3">
                Нет привязанных организаций
              </p>
            )}

            {availableOrganizations.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={addingOrgUuid}
                  onChange={(e) => setAddingOrgUuid(e.target.value)}
                  disabled={orgBusy === "__add__"}
                  className="w-full px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50"
                >
                  <option value="">— Выберите организацию —</option>
                  {availableOrganizations.map((o) => (
                    <option key={o.uuid} value={o.uuid}>
                      {o.name}
                      {o.inn ? ` (ИНН ${o.inn})` : ""}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={addingRole}
                    onChange={(e) => setAddingRole(e.target.value)}
                    placeholder="Роль (member)"
                    disabled={orgBusy === "__add__"}
                    className="flex-1 px-3 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-(--text-secondary) shrink-0">
                    <input
                      type="checkbox"
                      checked={addingPrimary}
                      onChange={(e) => setAddingPrimary(e.target.checked)}
                      disabled={orgBusy === "__add__"}
                    />
                    Осн.
                  </label>
                </div>

                <button
                  type="button"
                  onClick={addOrganization}
                  disabled={!addingOrgUuid || orgBusy === "__add__"}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-(--accent-dim) text-(--accent) hover:bg-(--accent) hover:text-(--bg-primary) transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {orgBusy === "__add__" && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Привязать
                </button>
              </div>
            ) : (
              <p className="text-xs text-(--text-muted)">
                Все доступные организации уже привязаны
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-(--border)">
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
