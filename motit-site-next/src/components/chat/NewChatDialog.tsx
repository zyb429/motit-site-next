// src/components/chat/NewChatDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Search, Users, MessageSquare } from "lucide-react";

type UserResult = {
  uuid: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

export function NewChatDialog({
  currentUserUuid,
  onCloseAction,
  onCreatedAction,
}: {
  currentUserUuid: string;
  onCloseAction: () => void;
  onCreatedAction: (chatUuid: string) => void;
}) {
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [selected, setSelected] = useState<UserResult[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
    }
  }

  // Поиск пользователей с debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      const exclude = [currentUserUuid, ...selected.map((s) => s.uuid)].join(",");
      const res = await fetch(
        `/api/chat/users/search?q=${encodeURIComponent(query)}&exclude=${exclude}`,
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.data ?? []);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentUserUuid, selected]);

  function pickUser(user: UserResult) {
    if (mode === "direct") {
      setSelected([user]);
      setResults([]);
      setQuery("");
    } else {
      setSelected((prev) => [...prev, user]);
      setResults([]);
      setQuery("");
    }
  }

  function removeUser(uuid: string) {
    setSelected((prev) => prev.filter((u) => u.uuid !== uuid));
  }

  async function handleCreate() {
    setError(null);

    if (mode === "direct" && selected.length !== 1) {
      setError("Выберите одного пользователя");
      return;
    }
    if (mode === "group" && selected.length === 0) {
      setError("Добавьте хотя бы одного участника");
      return;
    }
    if (mode === "group" && !groupName.trim()) {
      setError("Укажите название группы");
      return;
    }

    setLoading(true);
    try {
      const body =
        mode === "direct"
          ? { kind: "direct", userUuid: selected[0].uuid }
          : {
              kind: "group",
              name: groupName.trim(),
              memberUuids: selected.map((s) => s.uuid),
            };

      const res = await fetch("/api/chat/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(typeof d.error === "string" ? d.error : "Ошибка");
      }

      const data = await res.json();
      onCreatedAction(data.data.uuid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-(--bg-card) border border-(--border) rounded-xl w-full max-w-md">
        {/* Шапка */}
        <div className="flex items-center justify-between p-4 border-b border-(--border)">
          <h3 className="text-sm font-semibold text-(--text-primary)">
            Новый чат
          </h3>
          <button
            type="button"
            onClick={onCloseAction}
            className="text-(--text-muted) hover:text-(--text-primary)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Тип чата */}
        <div className="flex gap-1 p-3 border-b border-(--border)">
          <button
            type="button"
            onClick={() => {
              setMode("direct");
              setSelected([]);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              mode === "direct"
                ? "bg-(--accent-dim) text-(--accent) border border-(--accent)"
                : "border border-(--border) text-(--text-secondary)"
            }`}
          >
            <MessageSquare size={14} />
            Личный чат
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("group");
              setSelected([]);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              mode === "group"
                ? "bg-(--accent-dim) text-(--accent) border border-(--accent)"
                : "border border-(--border) text-(--text-secondary)"
            }`}
          >
            <Users size={14} />
            Группа
          </button>
        </div>

        {/* Название группы */}
        {mode === "group" && (
          <div className="p-3 border-b border-(--border)">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Название группы"
              maxLength={255}
              className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-sm text-(--text-primary) focus:border-(--accent) outline-none"
            />
          </div>
        )}

        {/* Выбранные */}
        {selected.length > 0 && (
          <div className="p-3 border-b border-(--border) flex flex-wrap gap-1.5">
            {selected.map((u) => (
              <div
                key={u.uuid}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-(--bg-primary) border border-(--border) text-xs"
              >
                <span className="text-(--text-primary)">
                  {u.full_name ?? u.username ?? "—"}
                </span>
                <button
                  type="button"
                  onClick={() => removeUser(u.uuid)}
                  className="text-(--text-muted) hover:text-red-400"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Поиск */}
        <div className="p-3">
          <div className="relative mb-2">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
            />
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Поиск пользователей (мин. 2 символа)…"
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-sm text-(--text-primary) focus:border-(--accent) outline-none"
            />
          </div>

          {/* Результаты */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {results.map((u) => (
              <button
                key={u.uuid}
                type="button"
                onClick={() => pickUser(u)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-(--bg-primary) text-left"
              >
                <div className="w-8 h-8 rounded-full bg-(--bg-primary) border border-(--border) flex items-center justify-center shrink-0 overflow-hidden">
                  {u.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.avatar_url}
                      alt={u.full_name ?? ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-(--text-muted)">
                      {(u.full_name ?? u.username ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-(--text-primary) truncate">
                    {u.full_name ?? u.username ?? "—"}
                  </div>
                  {u.email && (
                    <div className="text-xs text-(--text-muted) truncate">
                      {u.email}
                    </div>
                  )}
                </div>
              </button>
            ))}
            {query.trim().length >= 2 && results.length === 0 && (
              <div className="text-center py-4 text-xs text-(--text-muted)">
                Никого не найдено
              </div>
            )}
          </div>
        </div>

        {/* Ошибка + кнопка */}
        <div className="p-3 border-t border-(--border)">
          {error && (
            <p className="text-xs text-red-400 mb-2">{error}</p>
          )}
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading || selected.length === 0}
            className="w-full px-4 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Создание…" : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
}
