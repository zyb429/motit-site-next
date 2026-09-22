"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Building2,
  Pencil,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";
import { OrganizationModal } from "@/components/admin/OrganizationModal";

type Organization = {
  uuid: string;
  name: string;
  inn: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  clientsCount: number;
  ticketsCount: number;
};

export function OrganizationsTable({
  organizations,
}: {
  organizations: Organization[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Organization | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyUuid, setBusyUuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deleteOrg = async (uuid: string, name: string) => {
    if (!confirm(`Удалить организацию «${name}»? Действие необратимо.`)) return;
    setError(null);
    setBusyUuid(uuid);
    try {
      const res = await fetch(`/api/admin/organizations/${uuid}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка удаления");
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusyUuid(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Индикатор обновления */}
      {isPending && (
        <div className="flex justify-end">
          <span className="flex items-center gap-2 text-xs text-(--text-muted)">
            <Loader2 className="w-3 h-3 animate-spin" />
            Обновление...
          </span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {organizations.length === 0 ? (
        <div className="bg-(--bg-card) rounded-xl border border-dashed border-(--border) p-12 text-center">
          <div className="w-16 h-16 bg-(--bg-secondary) rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-(--text-muted)" />
          </div>
          <h3 className="text-lg font-semibold text-(--text-primary) mb-1">
            Организаций пока нет
          </h3>
          <p className="text-sm text-(--text-secondary) mb-4">
            Создайте первую организацию, чтобы она появилась здесь
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent) text-(--bg-primary) rounded-lg hover:bg-(--accent-hover) transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Создать организацию
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((o) => {
            const isBusy = busyUuid === o.uuid;
            return (
              <div
                key={o.uuid}
                className="group flex flex-col h-full bg-(--bg-card) rounded-xl shadow-sm border border-(--border) p-5 hover:border-(--border-hover) hover:shadow-md transition-all"
              >
                {/* Иконка + действия */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 bg-(--accent-dim) rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-(--accent)" />
                  </div>
                  <div className="flex items-center gap-1">
                    {isBusy && (
                      <Loader2 className="w-4 h-4 animate-spin text-(--accent)" />
                    )}
                    <button
                      type="button"
                      onClick={() => setEditing(o)}
                      disabled={isBusy}
                      title="Редактировать"
                      aria-label="Редактировать"
                      className="p-2 text-(--accent) hover:bg-(--accent-dim) rounded-lg transition-colors opacity-60 group-hover:opacity-100 disabled:opacity-30"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteOrg(o.uuid, o.name)}
                      disabled={isBusy}
                      title="Удалить"
                      aria-label="Удалить"
                      className="p-2 text-(--text-muted) hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-60 group-hover:opacity-100 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Название */}
                <h3 className="font-semibold text-(--text-primary) line-clamp-1">
                  {o.name}
                </h3>

                {/* ИНН */}
                <code className="text-xs text-(--text-muted) bg-(--bg-secondary) px-2 py-0.5 rounded font-mono inline-block mt-1 self-start">
                  ИНН: {o.inn || "—"}
                </code>

                {/* Статус */}
                {!o.is_active && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 mt-2 self-start">
                    неактивна
                  </span>
                )}

                {/* Контакты — фиксированная высота в 2 строки */}
                <div className="text-sm text-(--text-secondary) mt-2 min-h-10">
                  {o.email && <div className="truncate">{o.email}</div>}
                  {o.phone && <div>{o.phone}</div>}
                  {o.address && (
                    <div className="truncate text-xs text-(--text-muted)" title={o.address}>
                      {o.address}
                    </div>
                  )}
                  {!o.email && !o.phone && !o.address && "—"}
                </div>

                {/* Футер прижат к низу */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-(--border)">
                  <span className="text-xs text-(--text-muted) flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {o.clientsCount}{" "}
                    {o.clientsCount === 1
                      ? "клиент"
                      : o.clientsCount >= 2 && o.clientsCount <= 4
                        ? "клиента"
                        : "клиентов"}
                  </span>
                  {o.ticketsCount > 0 && (
                    <span className="text-xs text-(--text-muted) flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {o.ticketsCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модалки */}
      {creating && (
        <OrganizationModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            startTransition(() => router.refresh());
          }}
        />
      )}
      {editing && (
        <OrganizationModal
          organization={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            startTransition(() => router.refresh());
          }}
        />
      )}
    </div>
  );
}
