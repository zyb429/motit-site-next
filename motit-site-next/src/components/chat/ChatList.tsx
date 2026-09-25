// src/components/chat/ChatList.tsx
"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Plus, Search, Bookmark } from "lucide-react";
import type { ChatListItem as ChatListItemType } from "@/lib/db/chat";
import { ChatListItem } from "./ChatListItem";

export function ChatList({
  chats,
  currentUserUuid,
  basePath,
  onNewChatAction,
  onSavedAction,
}: {
  chats: ChatListItemType[];
  currentUserUuid: string;
  basePath: string;
  onNewChatAction?: () => void;
  onSavedAction ?: () => void;
}) {
  const [search, setSearch] = useState("");
  const pathname = usePathname();

  const filtered = useMemo(() => {
    if (!search.trim()) return chats;
    const q = search.toLowerCase();
    return chats.filter((c) => {
      const otherMember = c.members.find((m) => m.user.uuid !== currentUserUuid);
      const name =
        c.kind === "direct"
          ? otherMember?.user.full_name ?? otherMember?.user.username ?? ""
          : c.name ?? "";
      return name.toLowerCase().includes(q);
    });
  }, [chats, search, currentUserUuid]);

  const { pinned, regular } = useMemo(() => {
    return {
      pinned: filtered.filter((c) => c.is_pinned),
      regular: filtered.filter((c) => !c.is_pinned),
    };
  }, [filtered]);

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок + поиск */}
      <div className="p-4 border-b border-(--border)">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-(--text-primary)">Чаты</h2>
        <div className="flex items-center gap-1">
          {onSavedAction && (
            <button
              type="button"
              onClick={onSavedAction}
              className="p-1.5 rounded-lg border border-(--border) hover:border-(--accent) text-(--text-secondary) hover:text-(--accent) transition-colors"
              title="Saved Messages"
            >
              <Bookmark size={16} />
            </button>
          )}
          {onNewChatAction && (
            <button
              type="button"
              onClick={onNewChatAction}
              className="p-1.5 rounded-lg border border-(--border) hover:border-(--accent) text-(--text-secondary) hover:text-(--accent) transition-colors"
              title="Новый чат"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск чатов…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-(--bg-primary) border border-(--border) text-sm text-(--text-primary) focus:border-(--accent) outline-none"
          />
        </div>
      </div>

      {/* Список */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-(--text-muted)">
            {search ? "Ничего не найдено" : "Пока нет чатов"}
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--text-muted)">
                  Закреплённые
                </div>
                {pinned.map((c) => (
                  <ChatListItem
                    key={c.uuid}
                    chat={c}
                    currentUserUuid={currentUserUuid}
                    href={`${basePath}/${c.uuid}`}
                    isActive={pathname === `${basePath}/${c.uuid}`}
                  />
                ))}
              </>
            )}

            {regular.length > 0 && pinned.length > 0 && (
              <div className="px-2 py-1 mt-2 text-[10px] font-semibold uppercase tracking-wider text-(--text-muted)">
                Все чаты
              </div>
            )}

            {regular.map((c) => (
              <ChatListItem
                key={c.uuid}
                chat={c}
                currentUserUuid={currentUserUuid}
                href={`${basePath}/${c.uuid}`}
                isActive={pathname === `${basePath}/${c.uuid}`}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
