"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const getLoginUrl = useCallback(() => {
    const currentPath = `${pathname}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    return `/login?next=${encodeURIComponent(currentPath)}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/posts/${postId}/save-state`, { cache: "no-store" })
      .then((response) =>
        response.ok ? response.json() : { favorited: false, listIds: [] },
      )
      .then(
        (data: {
          favorited: boolean;
          listIds: number[];
        }) => {
          if (cancelled) return;

          setFavorited(data.favorited);
          setListIds(new Set(data.listIds));
        },
      )
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [postId]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    fetch("/api/lists", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          router.push(getLoginUrl());
          return [];
        }

        return response.ok ? response.json() : [];
      })
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
  }, [open, getLoginUrl, router]);

  useEffect(() => {
    if (open) {
      setTimeout(() => setMounted(true), 10);

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

  useEffect(() => {
    if (!open) return;

    const onDocClick = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (window.innerWidth >= 640) {
      document.addEventListener("mousedown", onDocClick);

      return () => {
        document.removeEventListener("mousedown", onDocClick);
      };
    }
  }, [open]);

  const handleMainClick = useCallback(async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (response.status === 401) {
        router.push(getLoginUrl());
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setFavorited(Boolean(data.favorited));
        setOpen(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }, [postId, getLoginUrl, router]);

  const toggleList = useCallback(
    async (listId: number) => {
      const inList = listIds.has(listId);

      setListIds((previous) => {
        const next = new Set(previous);

        if (inList) {
          next.delete(listId);
        } else {
          next.add(listId);
        }

        return next;
      });

      try {
        const response = await fetch(`/api/lists/${listId}/items`, {
          method: inList ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });

        if (response.status === 401) {
          router.push(getLoginUrl());
          return;
        }

        if (!response.ok) {
          throw new Error("Не удалось изменить список");
        }
      } catch {
        setListIds((previous) => {
          const next = new Set(previous);

          if (inList) {
            next.add(listId);
          } else {
            next.delete(listId);
          }

          return next;
        });
      }
    },
    [listIds, postId, getLoginUrl, router],
  );

  const createList = useCallback(async () => {
    const name = newListName.trim();

    if (!name) return;

    setCreatingList(true);

    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.status === 401) {
        router.push(getLoginUrl());
        return;
      }

      if (!response.ok) {
        return;
      }

      const list: List = await response.json();

      setLists((previous) => [list, ...previous]);
      setNewListName("");
      setListIds((previous) => new Set(previous).add(list.id));

      const itemResponse = await fetch(`/api/lists/${list.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (itemResponse.status === 401) {
        router.push(getLoginUrl());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingList(false);
    }
  }, [newListName, postId, getLoginUrl, router]);

  const menuContent = (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-(--border) px-3 py-2">
        <div className="text-sm font-medium text-(--text-primary)">
          Сохранить в списки
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1 text-(--text-muted) transition-colors hover:text-(--text-primary)"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-3 transition-colors hover:bg-(--bg-secondary) sm:py-1.5">
          <input
            type="checkbox"
            checked={favorited}
            onChange={handleMainClick}
            className="h-4 w-4 accent-(--accent)"
          />

          <Bookmark className="h-4 w-4 text-(--accent)" />

          <span className="text-sm text-(--text-primary)">Избранное</span>
        </label>

        {loading ? (
          <div className="flex items-center justify-center py-3 text-sm text-(--text-muted)">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Загрузка…
          </div>
        ) : lists.length === 0 ? (
          <div className="px-2 py-3 text-xs text-(--text-muted)">
            Пользовательских списков пока нет
          </div>
        ) : (
          lists.map((list) => (
            <label
              key={list.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-3 transition-colors hover:bg-(--bg-secondary) sm:py-1.5"
            >
              <input
                type="checkbox"
                checked={listIds.has(list.id)}
                onChange={() => toggleList(list.id)}
                className="h-4 w-4 accent-(--accent)"
              />

              <span className="flex-1 truncate text-sm text-(--text-primary)">
                {list.name}
              </span>

              {typeof list._count?.items === "number" && (
                <span className="ml-auto text-[10px] text-(--text-muted)">
                  {list._count.items}
                </span>
              )}
            </label>
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-(--border) p-3 pb-safe">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newListName}
            onChange={(event) => setNewListName(event.target.value)}
            placeholder="Новый список…"
            maxLength={100}
            className="flex-1 rounded-md border border-(--border) bg-(--bg-secondary) px-2 py-2.5 text-sm text-(--text-primary) outline-none focus:border-(--accent) sm:py-1.5"
            onKeyDown={(event) => {
              if (event.key === "Enter") createList();
            }}
          />

          <button
            type="button"
            onClick={createList}
            disabled={creatingList || !newListName.trim()}
            className="rounded-md bg-(--accent) p-2.5 text-(--bg-primary) transition-all hover:bg-(--accent-hover) active:scale-95 disabled:opacity-50 sm:p-2"
            aria-label="Создать список"
          >
            {creatingList ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleMainClick}
        disabled={saving}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
          favorited
            ? "border-(--accent) bg-(--accent) text-(--bg-primary) hover:bg-(--accent-hover)"
            : "border-(--border) bg-(--bg-card) text-(--text-secondary) hover:border-(--accent) hover:text-(--accent)"
        }`}
        aria-label={favorited ? "В избранном" : "Сохранить"}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bookmark
            className="h-4 w-4"
            fill={favorited ? "currentColor" : "none"}
          />
        )}

        <span className="hidden sm:inline">
          {favorited ? "В избранном" : "Сохранить"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 hidden w-72 rounded-xl border border-(--border) bg-(--bg-card) shadow-xl sm:block">
          {menuContent}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:hidden">
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setOpen(false)}
          />

          <div
            className={`relative flex max-h-[85vh] w-full flex-col rounded-t-2xl border border-(--border) bg-(--bg-card) shadow-2xl transition-transform duration-300 ease-out ${
              mounted ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mx-auto mb-1 mt-3 h-1.5 w-12 shrink-0 rounded-full bg-(--border)" />

            {menuContent}
          </div>
        </div>
      )}
    </div>
  );
}