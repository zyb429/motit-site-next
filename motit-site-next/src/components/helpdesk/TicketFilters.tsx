// src/components/helpdesk/TicketFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, useEffect, useRef } from "react";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";

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
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Блокировка скролла body на мобильных
  useEffect(() => {
    if (panelOpen && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [panelOpen]);

  // Закрытие по клику вне (только десктоп)
  useEffect(() => {
    if (!panelOpen) return;
    function onDocClick(e: MouseEvent) {
      if (window.innerWidth < 640) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [panelOpen]);

  // Закрытие по Escape
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
      params.delete("page");

      if (key === "category") {
        params.delete("categorySlug");
      }

      startTransition(() => {
        router.push(`${basePath}?${params.toString()}`);
      });
    },
    [router, searchParams, basePath],
  );

  const reset = () => {
    startTransition(() => {
      router.push(basePath);
      setPanelOpen(false);
    });
  };

  const activeFilters = [
    searchParams.get("status"),
    searchParams.get("priority"),
    searchParams.get("assigneeId"),
    searchParams.get("category") || searchParams.get("categorySlug"),
  ].filter(Boolean);

  const hasFilters = activeFilters.length > 0;
  const activeCount = activeFilters.length;

  const filtersContent = (
    <>
      <FilterField label="Статус">
        <select
          value={searchParams.get("status") ?? ""}
          onChange={(e) => update("status", e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg bg-(--bg-secondary) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) outline-none"
        >
          <option value="">Все статусы</option>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Приоритет">
        <select
          value={searchParams.get("priority") ?? ""}
          onChange={(e) => update("priority", e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg bg-(--bg-secondary) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) outline-none"
        >
          <option value="">Все приоритеты</option>
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </FilterField>

      {categories.length > 0 && (
        <FilterField label="Категория">
          <select
            value={searchParams.get("category") ?? ""}
            onChange={(e) => update("category", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-(--bg-secondary) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) outline-none"
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </FilterField>
      )}

      <FilterField label="Исполнитель">
        <select
          value={searchParams.get("assigneeId") ?? ""}
          onChange={(e) => update("assigneeId", e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg bg-(--bg-secondary) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) outline-none"
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
      </FilterField>

      <FilterField label="Сортировка">
        <select
          value={`${searchParams.get("sort") ?? "updated"}:${searchParams.get("dir") ?? "desc"}`}
          onChange={(e) => {
            const [sort, dir] = e.target.value.split(":");
            const params = new URLSearchParams(searchParams.toString());
            params.set("sort", sort);
            params.set("dir", dir);
            params.delete("page");
            startTransition(() =>
              router.push(`${basePath}?${params.toString()}`),
            );
          }}
          className="w-full px-3.5 py-2.5 rounded-lg bg-(--bg-secondary) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) outline-none"
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
      </FilterField>
    </>
  );

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
          />
          <input
            key={searchParams.get("search") ?? ""}
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              const t = setTimeout(() => update("search", value), 300);
              return () => clearTimeout(t);
            }}
            placeholder="Поиск по тикетам…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-(--bg-card) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) focus:ring-1 focus:ring-(--accent-dim) outline-none transition-all"
          />
          {searchParams.get("search") && (
            <button
              type="button"
              onClick={() => update("search", null)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-(--text-muted) hover:text-(--text-primary)"
              aria-label="Очистить поиск"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative shrink-0" ref={panelRef}>
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              hasFilters || panelOpen
                ? "bg-(--accent) text-(--bg-primary) border-(--accent)"
                : "bg-(--bg-card) text-(--text-secondary) border-(--border) hover:border-(--accent) hover:text-(--accent)"
            }`}
            aria-expanded={panelOpen}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Фильтры</span>
            {activeCount > 0 && (
              <span
                className={`text-[10px] font-semibold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 ${
                  hasFilters || panelOpen
                    ? "bg-(--bg-primary) text-(--accent)"
                    : "bg-(--accent-dim) text-(--accent)"
                }`}
              >
                {activeCount}
              </span>
            )}
            <ChevronDown
              size={14}
              className={`transition-transform ${panelOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Десктоп: Popover */}
          {panelOpen && (
            <div className="hidden sm:block absolute right-0 top-full mt-2 z-40 w-96 max-w-[calc(100vw-1rem)] rounded-xl border border-(--border) bg-(--bg-card) shadow-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-(--text-primary)">
                  Фильтры
                </div>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={reset}
                    className="text-xs text-(--accent) hover:underline"
                  >
                    Сбросить
                  </button>
                )}
              </div>
              {filtersContent}
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="w-full py-2.5 rounded-lg bg-(--accent) text-(--bg-primary) text-sm font-medium hover:bg-(--accent-hover) transition-colors"
              >
                Готово
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Мобильные: Bottom Sheet */}
      {panelOpen && (
        <div className="sm:hidden fixed inset-0 z-[100] flex items-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPanelOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-h-[85vh] rounded-t-3xl border-t border-(--border) bg-(--bg-card) shadow-2xl flex flex-col overflow-hidden">
            <div className="w-12 h-1.5 bg-(--border) rounded-full mx-auto mt-3 shrink-0" />
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) shrink-0">
              <div className="text-base font-semibold text-(--text-primary)">
                Фильтры
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="p-2 rounded-lg text-(--text-muted) hover:bg-(--bg-secondary) active:scale-95 transition-all"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>
            {/* Скроллится только контент */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3">
              {filtersContent}
            </div>
            <div className="p-4 border-t border-(--border) flex gap-2 shrink-0 pb-safe">
              {hasFilters && (
                <button
                  type="button"
                  onClick={reset}
                  className="flex-1 py-2.5 rounded-lg border border-(--border) text-(--text-secondary) text-sm font-medium hover:bg-(--bg-secondary)"
                >
                  Сбросить
                </button>
              )}
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-(--accent) text-(--bg-primary) text-sm font-semibold"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}

      {pending && (
        <div className="mt-2 flex items-center gap-2 text-xs text-(--text-muted)">
          <div className="w-3 h-3 rounded-full border-2 border-(--accent) border-t-transparent animate-spin" />
          Загрузка…
        </div>
      )}
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-(--text-muted) mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}