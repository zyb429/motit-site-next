"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";

type Option = { value: string; label: string };

interface Props {
  statuses: Option[];
  priorities: Option[];
  categories: Option[];
  agents: Option[];
  basePath: string;
}

export function TicketFilters({
  statuses,
  priorities,
  categories,
  agents,
  basePath,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
      params.delete("page"); // сбрасываем страницу при смене фильтра
      startTransition(() => {
        router.push(`${basePath}?${params.toString()}`);
      });
    },
    [router, searchParams, basePath],
  );

  const reset = () => {
    startTransition(() => router.push(basePath));
  };

  const hasFilters =
    searchParams.has("status") ||
    searchParams.has("priority") ||
    searchParams.has("assigneeId") ||
    searchParams.has("category") ||
    searchParams.has("search");

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Поиск */}
      <div className="relative flex-1 min-w-50">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)"
        />
        <input
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            // дебаунс через setTimeout
            const t = setTimeout(() => update("search", value), 300);
            return () => clearTimeout(t);
          }}
          placeholder="Поиск по тикетам…"
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-(--bg-card) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) outline-none"
        />
      </div>

      {/* Статус */}
      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="px-3 py-2 rounded-lg bg-(--bg-card) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) outline-none"
      >
        <option value="">Все статусы</option>
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Приоритет */}
      <select
        value={searchParams.get("priority") ?? ""}
        onChange={(e) => update("priority", e.target.value)}
        className="px-3 py-2 rounded-lg bg-(--bg-card) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) outline-none"
      >
        <option value="">Все приоритеты</option>
        {priorities.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {/* Категория */}
      {categories.length > 0 && (
        <select
          value={searchParams.get("category") ?? ""}
          onChange={(e) => update("category", e.target.value)}
          className="px-3 py-2 rounded-lg bg-(--bg-card) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) outline-none"
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      )}

      {/* Исполнитель */}
      <select
        value={searchParams.get("assigneeId") ?? ""}
        onChange={(e) => update("assigneeId", e.target.value)}
        className="px-3 py-2 rounded-lg bg-(--bg-card) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) outline-none"
      >
        <option value="">Все исполнители</option>
        <option value="me">Мои</option>
        <option value="unassigned">Без исполнителя</option>
        {agents.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </select>

      {/* Сортировка */}
      <select
        value={`${searchParams.get("sort") ?? "updated"}:${searchParams.get("dir") ?? "desc"}`}
        onChange={(e) => {
          const [sort, dir] = e.target.value.split(":");
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", sort);
          params.set("dir", dir);
          params.delete("page");
          startTransition(() => router.push(`${basePath}?${params.toString()}`));
        }}
        className="px-3 py-2 rounded-lg bg-(--bg-card) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) outline-none"
      >
        <option value="updated:desc">Обновлённые ↓</option>
        <option value="updated:asc">Обновлённые ↑</option>
        <option value="created:desc">Новые ↓</option>
        <option value="created:asc">Старые ↑</option>
        <option value="priority:desc">Приоритет ↓</option>
        <option value="priority:asc">Приоритет ↑</option>
        <option value="deadline:asc">Дедлайн ↑</option>
        <option value="deadline:desc">Дедлайн ↓</option>
      </select>

      {/* Сброс */}
      {hasFilters && (
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-(--border) text-(--text-muted) text-sm hover:text-(--accent) hover:border-(--accent) transition-colors"
        >
          <X size={14} />
          Сбросить
        </button>
      )}

      {pending && (
        <span className="text-xs text-(--text-muted) ml-auto">Загрузка…</span>
      )}
    </div>
  );
}
