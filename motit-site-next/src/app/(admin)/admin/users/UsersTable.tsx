// src/app/(admin)/admin/users/UsersTable.tsx
"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User as UserIcon,
  Users,
  Ban,
  CheckCircle2,
  Trash2,
  Loader2,
  Pencil,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { EditUserModal } from "@/components/admin/EditUserModal";

type Role = {
  id: number;
  name: string;
  type: string;
};

type Organization = {
  uuid: string;
  name: string;
  inn: string | null;
  role_in_company: string;
  is_primary: boolean;
  is_active: boolean;
};

type User = {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  blocked?: boolean;
  confirmed?: boolean;
  createdAt: string;
  role?: Role | null;
  avatar: { id: number; url: string | null; name: string | null } | null;
  organizations?: Organization[];
};

type SortKey = "username" | "email" | "createdAt" | "organizations";
type SortDir = "asc" | "desc";

interface SortHeaderProps {
  label: string;
  sortKeyName: SortKey;
  currentSortKey: SortKey;
  currentSortDir: SortDir;
  onToggle: (key: SortKey) => void;
  className?: string;
}

function SortHeader({
  label,
  sortKeyName,
  currentSortKey,
  currentSortDir,
  onToggle,
  className = "",
}: SortHeaderProps) {
  const isActive = currentSortKey === sortKeyName;

  return (
    <th
      className={`text-left px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider ${className}`}
    >
      <button
        type="button"
        onClick={() => onToggle(sortKeyName)}
        className="inline-flex items-center gap-1 hover:text-(--text-primary) transition-colors select-none"
      >
        {label}
        {isActive ? (
          currentSortDir === "asc" ? (
            <ArrowUp className="w-3 h-3 text-(--accent)" />
          ) : (
            <ArrowDown className="w-3 h-3 text-(--accent)" />
          )
        ) : (
          <span className="w-3 h-3 opacity-0 group-hover:opacity-30">
            <ArrowUp className="w-3 h-3" />
          </span>
        )}
      </button>
    </th>
  );
}

interface Props {
  users: User[];
  roles: Role[];
  allOrganizations: { uuid: string; name: string; inn: string | null }[];
}

export function UsersTable({ users, roles, allOrganizations }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "createdAt" ? "desc" : "asc");
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    const result = users.filter((u) => {
      const matchQuery =
        !q ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q) ||
        u.organizations?.some((o) => o.name.toLowerCase().includes(q));

      const matchRole = roleFilter === "all" || u.role?.name === roleFilter;

      const matchOrg =
        orgFilter === "all" ||
        u.organizations?.some((o) => o.uuid === orgFilter);

      return matchQuery && matchRole && matchOrg;
    });

    result.sort((a, b) => {
      let cmp = 0;

      switch (sortKey) {
        case "username":
          cmp = (a.username || "").localeCompare(b.username || "", "ru");
          break;
        case "email":
          cmp = (a.email || "").localeCompare(b.email || "", "ru");
          break;
        case "createdAt":
          cmp = a.createdAt.localeCompare(b.createdAt);
          break;
        case "organizations": {
          const aOrg =
            a.organizations?.find((o) => o.is_primary)?.name ??
            a.organizations?.[0]?.name ??
            "";
          const bOrg =
            b.organizations?.find((o) => o.is_primary)?.name ??
            b.organizations?.[0]?.name ??
            "";
          cmp = aOrg.localeCompare(bOrg, "ru");
          break;
        }
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [users, query, roleFilter, orgFilter, sortKey, sortDir]);

  const updateUser = async (
    id: number,
    patch: { roleId?: number; blocked?: boolean },
  ) => {
    setError(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка сохранения");
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (id: number, username: string) => {
    if (
      !confirm(`Удалить пользователя @${username}? Это действие необратимо.`)
    ) {
      return;
    }
    setError(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
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
      setBusyId(null);
    }
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const roleColor = (name?: string) => {
    const n = (name ?? "").toLowerCase();
    if (n === "admin") return "bg-red-500/10 text-red-400 border-red-500/20";
    if (n === "worker" || n === "support")
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (n === "statistics")
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    return "bg-(--accent-dim) text-(--accent) border-(--accent)/20";
  };

  return (
    <div className="space-y-4">
      {/* Фильтры */}
      <div className="bg-(--bg-card) rounded-xl border border-(--border) p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-(--text-muted) absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isPending}
              placeholder="Поиск по имени, email, username или организации..."
              className="w-full pl-10 pr-4 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent) focus:outline-none text-sm disabled:opacity-60"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            disabled={isPending}
            className="px-4 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) focus:border-(--accent) focus:outline-none text-sm disabled:opacity-60"
          >
            <option value="all">Все роли</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            disabled={isPending}
            className="px-4 py-2 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) focus:border-(--accent) focus:outline-none text-sm disabled:opacity-60 max-w-60 truncate"
          >
            <option value="all">Все организации</option>
            {allOrganizations.map((o) => (
              <option key={o.uuid} value={o.uuid}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {isPending && (
          <div className="mt-3 flex items-center gap-2 text-xs text-(--text-muted)">
            <Loader2 className="w-3 h-3 animate-spin" />
            Обновление...
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Таблица */}
      <div className="bg-(--bg-card) rounded-xl border border-(--border) overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-(--bg-secondary) rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-(--text-muted)" />
            </div>
            <h3 className="text-lg font-semibold text-(--text-primary) mb-1">
              {query || roleFilter !== "all" || orgFilter !== "all"
                ? "Ничего не найдено"
                : "Пользователей нет"}
            </h3>
            <p className="text-sm text-(--text-secondary)">
              {query || roleFilter !== "all" || orgFilter !== "all"
                ? "Попробуйте изменить фильтры"
                : "Здесь появятся зарегистрированные пользователи"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-(--bg-secondary) border-b border-(--border)">
              <tr>
                <SortHeader
                  label="Пользователь"
                  sortKeyName="username"
                  currentSortKey={sortKey}
                  currentSortDir={sortDir}
                  onToggle={toggleSort}
                />
                <SortHeader
                  label="Email"
                  sortKeyName="email"
                  currentSortKey={sortKey}
                  currentSortDir={sortDir}
                  onToggle={toggleSort}
                  className="hidden md:table-cell"
                />
                <th className="text-left px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider hidden lg:table-cell">
                  Телефон
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                  Роль
                </th>
                <SortHeader
                  label="Организации"
                  sortKeyName="organizations"
                  currentSortKey={sortKey}
                  currentSortDir={sortDir}
                  onToggle={toggleSort}
                  className="hidden lg:table-cell"
                />
                <SortHeader
                  label="Регистрация"
                  sortKeyName="createdAt"
                  currentSortKey={sortKey}
                  currentSortDir={sortDir}
                  onToggle={toggleSort}
                  className="hidden xl:table-cell"
                />
                <th className="text-right px-4 py-3 text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {filtered.map((u) => {
                const isBusy = busyId === u.id;
                const displayName = u.full_name || u.username;
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-(--bg-secondary)/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-(--bg-secondary) flex items-center justify-center shrink-0">
                          {u.avatar?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatar.url}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-4 h-4 text-(--text-muted)" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-(--text-primary) truncate flex items-center gap-1.5">
                            {displayName}
                            {u.blocked && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                заблокирован
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-(--text-muted) truncate">
                            @{u.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-(--text-secondary) truncate">
                        {u.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-(--text-secondary) truncate">
                        {u.phone || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role?.id ?? ""}
                        onChange={(e) =>
                          updateUser(u.id, {
                            roleId: Number(e.target.value),
                          })
                        }
                        disabled={isBusy}
                        className={`text-xs px-2 py-1 rounded-full border font-medium cursor-pointer ${roleColor(u.role?.name)} disabled:opacity-50`}
                      >
                        {!u.role && <option value="">Нет роли</option>}
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {u.organizations && u.organizations.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-50">
                          {u.organizations.slice(0, 2).map((org) => (
                            <span
                              key={org.uuid}
                              title={`${org.name} — ${org.role_in_company}${org.is_primary ? " · основная" : ""}`}
                              className={`text-xs px-2 py-0.5 rounded-full border truncate max-w-30 ${
                                org.is_primary
                                  ? "bg-(--accent-dim) text-(--accent) border-(--accent)/20"
                                  : "bg-(--bg-secondary) text-(--text-secondary) border-(--border)"
                              }`}
                            >
                              {org.name}
                            </span>
                          ))}
                          {u.organizations.length > 2 && (
                            <span className="text-xs text-(--text-muted) self-center">
                              +{u.organizations.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-(--text-muted)">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs text-(--text-secondary)">
                        {formatDate(u.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isBusy && (
                          <Loader2 className="w-4 h-4 animate-spin text-(--accent)" />
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingUser(u)}
                          disabled={isBusy}
                          title="Редактировать"
                          aria-label="Редактировать"
                          className="p-2 rounded-lg text-(--text-muted) hover:text-(--accent) hover:bg-(--accent-dim) transition-colors disabled:opacity-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateUser(u.id, { blocked: !u.blocked })
                          }
                          disabled={isBusy}
                          title={u.blocked ? "Разблокировать" : "Заблокировать"}
                          className={`p-2 rounded-lg transition-colors ${
                            u.blocked
                              ? "text-(--accent) hover:bg-(--accent-dim)"
                              : "text-(--text-muted) hover:text-yellow-400 hover:bg-yellow-500/10"
                          }`}
                        >
                          {u.blocked ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUser(u.id, u.username)}
                          disabled={isBusy}
                          title="Удалить"
                          className="p-2 rounded-lg text-(--text-muted) hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Футер со счётчиком */}
      {filtered.length > 0 && (
        <p className="text-xs text-(--text-muted) text-center">
          Показано {filtered.length} из {users.length}
        </p>
      )}

      {/* Модалка редактирования */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          allOrganizations={allOrganizations}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setEditingUser(null);
            startTransition(() => router.refresh());
          }}
        />
      )}
    </div>
  );
}
