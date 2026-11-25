"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addCollaboratorAction } from "./actions";
import { Search, UserPlus, X } from "lucide-react";

type FoundUser = {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
};

export function AddCollaboratorForm({ postId }: { postId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoundUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<FoundUser | null>(null);
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(query.trim())}`,
        );

        if (!res.ok) throw new Error("Ошибка поиска");

        const json = await res.json();
        setResults(json.data || []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectUser(user: FoundUser) {
    setSelectedUser(user);
    setQuery(user.full_name || user.username || user.email);
    setResults([]);
    setIsOpen(false);
  }

  function handleSubmit() {
    if (!selectedUser) return;

    setError(null);

    startTransition(async () => {
      const result = await addCollaboratorAction(
        postId,
        selectedUser.id,
        role,
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      setSelectedUser(null);
      setQuery("");
      setRole("editor");
    });
  }

  return (
    <div ref={containerRef} className="relative space-y-3">
      <div className="space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />

          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedUser(null);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Поиск по имени, тегу или email"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] py-2 pl-9 pr-9 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedUser(null);
                setResults([]);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOpen && query.trim().length >= 2 && (
          <div className="absolute z-20 w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-lg">
            {isSearching ? (
              <p className="px-3 py-3 text-xs text-[var(--text-muted)]">
                Ищем пользователей…
              </p>
            ) : results.length === 0 ? (
              <p className="px-3 py-3 text-xs text-[var(--text-muted)]">
                Ничего не найдено
              </p>
            ) : (
              <ul className="max-h-64 overflow-y-auto">
                {results.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => selectUser(user)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[var(--bg-secondary)]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-secondary)] text-xs font-semibold">
                        {user.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          (user.full_name || user.username)
                            ?.slice(0, 2)
                            .toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {user.full_name || user.username}
                        </p>
                        <p className="truncate text-xs text-[var(--text-muted)]">
                          @{user.username} · {user.email}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-secondary)] text-xs font-semibold">
            {selectedUser.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedUser.avatar_url}
                alt={selectedUser.username}
                className="h-full w-full object-cover"
              />
            ) : (
              (selectedUser.full_name || selectedUser.username)
                ?.slice(0, 2)
                .toUpperCase()
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {selectedUser.full_name || selectedUser.username}
            </p>
            <p className="truncate text-xs text-[var(--text-muted)]">
              {selectedUser.email}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setQuery("");
            }}
            className="rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <select
          value={role}
          onChange={(event) =>
            setRole(event.target.value as "editor" | "viewer")
          }
          disabled={!selectedUser}
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors disabled:opacity-50"
        >
          <option value="editor">Редактор</option>
          <option value="viewer">Наблюдатель</option>
        </select>

        <button
          type="button"
          disabled={!selectedUser || isPending}
          onClick={handleSubmit}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="h-4 w-4" />
          {isPending ? "Добавление..." : "Добавить"}
        </button>
      </div>

      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}