// src/components/chat/ForwardDialog.tsx
"use client";

import { useState, useMemo } from "react";
import { X, Search, Check } from "lucide-react";
import type { ChatListItem } from "@/lib/db/chat";

export function ForwardDialog({
  chats,
  currentUserUuid,
  onCloseAction,
  onForwardAction,
}: {
  chats: ChatListItem[];
  currentUserUuid: string;
  onCloseAction: () => void;
  onForwardAction: (chatUuids: string[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return chats;
    const q = search.toLowerCase();
    return chats.filter((c) => {
      const other = c.members.find((m) => m.user.uuid !== currentUserUuid);
      const name =
        c.kind === "direct"
          ? other?.user.full_name ?? other?.user.username ?? ""
          : c.name ?? "";
      return name.toLowerCase().includes(q);
    });
  }, [chats, search, currentUserUuid]);

  function toggle(uuid: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  }

  async function handleForward() {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      await onForwardAction([...selected]);
      onCloseAction();
    } finally {
      setLoading(false);
    }
  }

  function chatName(c: ChatListItem): string {
    if (c.kind === "direct") {
      const other = c.members.find((m) => m.user.uuid !== currentUserUuid);
      return other?.user.full_name ?? other?.user.username ?? "—";
    }
    return c.name ?? "—";
  }

  return (
    <div className="fixed inset-0 z-120 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-(--bg-card) border border-(--border) rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-(--border)">
          <h3 className="text-sm font-semibold text-(--text-primary)">Переслать в…</h3>
          <button
            type="button"
            onClick={onCloseAction}
            className="text-(--text-muted) hover:text-(--text-primary)"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3 border-b border-(--border)">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск чатов…"
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-sm text-(--text-primary) focus:border-(--accent) outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-(--text-muted)">
              {search ? "Ничего не найдено" : "Нет доступных чатов"}
            </div>
          ) : (
            filtered.map((c) => {
              const isSelected = selected.has(c.uuid);
              return (
                <button
                  key={c.uuid}
                  type="button"
                  onClick={() => toggle(c.uuid)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    isSelected ? "bg-(--accent-dim)" : "hover:bg-(--bg-primary)"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-(--accent) border-(--accent)"
                        : "border-(--border)"
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-(--bg-card)" />}
                  </div>
                  <div className="text-sm text-(--text-primary) truncate">
                    {chatName(c)}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-(--border)">
          <button
            type="button"
            onClick={handleForward}
            disabled={selected.size === 0 || loading}
            className="w-full px-4 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Пересылка…" : `Переслать (${selected.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
