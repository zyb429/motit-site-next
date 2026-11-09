// src/components/blog/SaveButton.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, Plus, Loader2, X } from "lucide-react";

type List = {
  id: number;
  name: string;
  isPublic: boolean;
  _count?: { items: number };
};

export function SaveButton({
  postId,
  className = "",
}: {
  postId: number;
  className?: string;
}) {
  const [favorited, setFavorited] = useState(false);
  const [listIds, setListIds] = useState<Set<number>>(new Set());
  const [lists, setLists] = useState<List[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Загрузка начального состояния
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/posts/${postId}/save-state`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { favorited: false, listIds: [] }))
      .then((data: { favorited: boolean; listIds: number[] }) => {
        if (cancelled) return;
        setFavorited(data.favorited);
        setListIds(new Set(data.listIds));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [postId]);

  // Загрузка списков при открытии
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/lists", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: List[]) => {
        if (!cancelled) setLists(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Анимация появления + блокировка скролла для мобилок
  useEffect(() => {
    if (open) {
      setTimeout(() => setMounted(true), 10);
      // Блокировка скролла только на мобильных (где Bottom Sheet)
      if (window.innerWidth < 640) {
        document.body.style.overflow = "hidden";
      }
    } else {
      setMounted(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Закрытие по клику вне (только для десктопа)
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    // Добавляем только если это десктоп
    if (window.innerWidth >= 640) {
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }
  }, [open]);

  const handleMainClick = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFavorited(!!data.favorited);
        setOpen(true);
      }
    } finally {
      setSaving(false);
    }
  }, [postId]);

  const toggleList = useCallback(
    async (listId: number) => {
      const inList = listIds.has(listId);
      setListIds((prev) => {
        const next = new Set(prev);
        if (inList) next.delete(listId);
        else next.add(listId);
        return next;
      });
      try {
        const res = await fetch(`/api/lists/${listId}/items`, {
          method: inList ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        if (!res.ok) throw new Error("fail");
      } catch {
        setListIds((prev) => {
          const next = new Set(prev);
          if (inList) next.add(listId);
          else next.delete(listId);
          return next;
        });
      }
    },
    [listIds, postId],
  );

  const createList = useCallback(async () => {
    const name = newListName.trim();
    if (!name) return;
    setCreatingList(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return;
      const list: List = await res.json();
      setLists((prev) => [list, ...prev]);
      setNewListName("");
      setListIds((prev) => new Set(prev).add(list.id));
      await fetch(`/api/lists/${list.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
    } finally {
      setCreatingList(false);
    }
  }, [newListName, postId]);

  // Общий контент для меню (список, избранное, создание)
  const menuContent = (
    <>
      <div className="flex items-center justify-between px-3 py-2 border-b border-(--border) shrink-0">
        <div className="text-sm font-medium text-(--text-primary)">
          Сохранить в списки
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1 text-(--text-muted) hover:text-(--text-primary) transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-64 sm:max-h-64 max-h-[50vh] overflow-y-auto p-2 flex-1">
        {/* Избранное */}
        <label className="flex items-center gap-2 px-2 py-3 sm:py-1.5 rounded-md hover:bg-(--bg-secondary) cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={favorited}
            onChange={handleMainClick}
            className="w-4 h-4 accent-(--accent)"
          />
          <Bookmark className="w-4 h-4 text-(--accent)" />
          <span className="text-sm text-(--text-primary)">Избранное</span>
        </label>

        {loading ? (
          <div className="flex items-center justify-center py-3 text-(--text-muted) text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Загрузка…
          </div>
        ) : lists.length === 0 ? (
          <div className="px-2 py-3 text-xs text-(--text-muted)">
            Пользовательских списков пока нет
          </div>
        ) : (
          lists.map((l) => (
            <label
              key={l.id}
              className="flex items-center gap-2 px-2 py-3 sm:py-1.5 rounded-md hover:bg-(--bg-secondary) cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={listIds.has(l.id)}
                onChange={() => toggleList(l.id)}
                className="w-4 h-4 accent-(--accent)"
              />
              <span className="text-sm text-(--text-primary) truncate flex-1">
                {l.name}
              </span>
              {typeof l._count?.items === "number" && (
                <span className="ml-auto text-[10px] text-(--text-muted)">
                  {l._count.items}
                </span>
              )}
            </label>
          ))
        )}
      </div>

      {/* Создание нового списка */}
      <div className="border-t border-(--border) p-3 shrink-0 pb-safe">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Новый список…"
            maxLength={100}
            className="flex-1 px-2 py-2.5 sm:py-1.5 rounded-md bg-(--bg-secondary) border border-(--border) text-sm text-(--text-primary) focus:border-(--accent) outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") createList();
            }}
          />
          <button
            type="button"
            onClick={createList}
            disabled={creatingList || !newListName.trim()}
            className="p-2.5 sm:p-2 rounded-md bg-(--accent) text-(--bg-primary) disabled:opacity-50 hover:bg-(--accent-hover) active:scale-95 transition-all"
            aria-label="Создать список"
          >
            {creatingList ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      {/* Основная кнопка */}
      <button
        type="button"
        onClick={handleMainClick}
        disabled={saving}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
          favorited
            ? "bg-(--accent) text-(--bg-primary) border-(--accent) hover:bg-(--accent-hover)"
            : "bg-(--bg-card) text-(--text-secondary) border-(--border) hover:border-(--accent) hover:text-(--accent)"
        } disabled:opacity-50`}
        aria-label={favorited ? "В избранном" : "Сохранить"}
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Bookmark
            className="w-4 h-4"
            fill={favorited ? "currentColor" : "none"}
          />
        )}
        <span className="hidden sm:inline">
          {favorited ? "В избранном" : "Сохранить"}
        </span>
      </button>

      {/* ================= ДЕСКТОП: выпадающее меню ================= */}
      {open && (
        <div className="hidden sm:block absolute right-0 mt-2 w-72 z-50 rounded-xl border border-(--border) bg-(--bg-card) shadow-xl">
          {menuContent}
        </div>
      )}

      {/* ================= МОБИЛЬНЫЕ: Bottom Sheet ================= */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-[100] flex items-end justify-center">
          {/* Подложка */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setOpen(false)}
          />

          {/* Контент */}
          <div
            className={`relative w-full bg-(--bg-card) border border-(--border) shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
              mounted ? "translate-y-0" : "translate-y-full"
            } rounded-t-2xl max-h-[85vh]`}
          >
            {/* Ручка для свайпа */}
            <div className="w-12 h-1.5 bg-(--border) rounded-full mx-auto mt-3 mb-1 shrink-0" />
            {menuContent}
          </div>
        </div>
      )}
    </div>
  );
}