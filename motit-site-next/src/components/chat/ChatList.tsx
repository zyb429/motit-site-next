// src/components/chat/ChatList.tsx
"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Plus,
  Search,
  Bookmark,
  Ticket,
  MessageSquare,
  Users,
} from "lucide-react";
import type { ChatListItem as ChatListItemType } from "@/lib/db/chat";
import { ChatListItem } from "./ChatListItem";

type Tab = "tickets" | "direct" | "groups";

export function ChatList({
  chats,
  currentUserUuid,
  basePath,
  onNewChatAction,
  onSavedAction,
  onContextMenuAction,
  onChatClickAction,
}: {
  chats: ChatListItemType[];
  currentUserUuid: string;
  basePath: string;
  onNewChatAction?: () => void;
  onSavedAction?: () => void;
  onContextMenuAction?: (
    chat: ChatListItemType,
    x: number,
    y: number,
  ) => void;
  onChatClickAction?: (chat: ChatListItemType) => void;
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("tickets");
  const pathname = usePathname();

  const categorized = useMemo(() => {
    const list = Array.isArray(chats) ? chats : [];
    return {
      tickets: list.filter((c) => c.kind === "ticket"),
      direct: list.filter(
        (c) =>
          c.kind === "direct" ||
          c.kind === "saved" ||
          c.kind === "channel" ||
          c.kind === "private_channel",
      ),
      groups: list.filter((c) => c.kind === "group"),
    };
  }, [chats]);

  const tabs: {
    key: Tab;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    count: number;
  }[] = [
    {
      key: "tickets",
      label: "Заявки",
      shortLabel: "Заявки",
      icon: <Ticket size={16} />,
      count: categorized.tickets.length,
    },
    {
      key: "direct",
      label: "Личные",
      shortLabel: "ЛС",
      icon: <MessageSquare size={16} />,
      count: categorized.direct.length,
    },
    {
      key: "groups",
      label: "Группы",
      shortLabel: "Группы",
      icon: <Users size={16} />,
      count: categorized.groups.length,
    },
  ];

  const activeChats = categorized[tab] ?? [];

  const filtered = useMemo(() => {
    if (!Array.isArray(activeChats)) return [];
    if (!search.trim()) return activeChats;
    const q = search.toLowerCase();
    return activeChats.filter((c) => {
      const otherMember = c.members.find(
        (m) => m.user.uuid !== currentUserUuid,
      );
      const name =
        c.kind === "direct"
          ? otherMember?.user.full_name ?? otherMember?.user.username ?? ""
          : c.name ?? "";
      return name.toLowerCase().includes(q);
    });
  }, [activeChats, search, currentUserUuid]);

  const { pinned, regular } = useMemo(() => {
    const list = Array.isArray(filtered) ? filtered : [];
    return {
      pinned: list.filter((c) => c.is_pinned),
      regular: list.filter((c) => !c.is_pinned),
    };
  }, [filtered]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-(--bg-card)">
      {/* Шапка */}
      <div className="shrink-0 px-3 pt-3 pb-2 border-b border-(--border)">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-semibold text-(--text-primary)">
            Сообщения
          </h2>
          <div className="flex items-center gap-1">
            {onSavedAction && (
              <button
                type="button"
                onClick={onSavedAction}
                className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--accent) hover:bg-(--accent-dim) transition-colors"
                title="Избранное"
              >
                <Bookmark size={16} />
              </button>
            )}
            {onNewChatAction && (
              <button
                type="button"
                onClick={onNewChatAction}
                className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--accent) hover:bg-(--accent-dim) transition-colors"
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
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по чатам…"
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-(--bg-secondary) border border-(--border) text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent) focus:ring-1 focus:ring-(--accent-dim) outline-none transition-all"
          />
        </div>
      </div>

      {/* Табы (3 шт.) */}
      <div className="shrink-0 border-b border-(--border)">
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-2.5 text-xs font-medium whitespace-nowrap transition-colors relative border-b-2 ${
                tab === t.key
                  ? "text-(--accent) border-(--accent)"
                  : "text-(--text-muted) border-transparent hover:text-(--text-primary) hover:bg-(--bg-secondary)"
              }`}
            >
              <span className="hidden xs:inline sm:inline">{t.icon}</span>
              <span className="text-[11px] sm:text-xs">{t.shortLabel}</span>
              {t.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                    tab === t.key
                      ? "bg-(--accent-dim) text-(--accent)"
                      : "bg-(--bg-secondary) text-(--text-muted)"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Список */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-(--bg-secondary) flex items-center justify-center mb-3">
              {tab === "tickets" ? (
                <Ticket size={22} className="text-(--text-muted) opacity-60" />
              ) : tab === "direct" ? (
                <MessageSquare
                  size={22}
                  className="text-(--text-muted) opacity-60"
                />
              ) : (
                <Users size={22} className="text-(--text-muted) opacity-60" />
              )}
            </div>
            <p className="text-sm font-medium text-(--text-primary) mb-1">
              {search
                ? "Ничего не найдено"
                : tab === "tickets"
                  ? "Нет чатов по заявкам"
                  : tab === "direct"
                    ? "Нет личных чатов"
                    : "Нет групп"}
            </p>
            <p className="text-xs text-(--text-muted) max-w-[220px]">
              {search
                ? "Попробуйте изменить запрос"
                : "Здесь появятся чаты, когда вы начнёте общение"}
            </p>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-(--text-muted) flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-(--accent)" />
                  Закреплённые
                </div>
                {pinned.map((c) => (
                  <ChatListItem
                    key={c.uuid}
                    chat={c}
                    currentUserUuid={currentUserUuid}
                    href={`${basePath}/${c.uuid}`}
                    isActive={pathname === `${basePath}/${c.uuid}`}
                    onContextMenuAction={onContextMenuAction}
                    onChatClickAction={onChatClickAction}
                  />
                ))}
              </>
            )}

            {regular.length > 0 && pinned.length > 0 && (
              <div className="px-2 py-1.5 mt-2 text-[10px] font-semibold uppercase tracking-wider text-(--text-muted)">
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
                onContextMenuAction={onContextMenuAction}
                onChatClickAction={onChatClickAction}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}