// src/components/chat/ChatListSidebar.tsx
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChatList } from "./ChatList";
import { NewChatDialog } from "./NewChatDialog";
import { ChatContextMenu } from "./ChatContextMenu";
import { useChatSocket } from "@/hooks/useChatSocket";
import type { ChatListItem } from "@/lib/db/chat";

export function ChatListSidebar({
  initialChats,
  currentUserUuid,
  basePath,
}: {
  initialChats: ChatListItem[];
  currentUserUuid: string;
  basePath: string;
}) {
  const router = useRouter();
  const [chats, setChats] = useState(initialChats);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [menu, setMenu] = useState<{
    chat: ChatListItem;
    x: number;
    y: number;
  } | null>(null);

  // Свежие роли при заходе на страницу:
  // initialChats из RSC могут быть устаревшими (stale role)
  useEffect(() => {
    refreshChats();
  }, [currentUserUuid]);

  // Слушаем персональное событие: удалён из чата / чат удалён
  const chatUuids = useMemo(() => chats.map((c) => c.uuid), [chats]);

useChatSocket({
  userUuid: currentUserUuid,
  chatUuids,
  onMessageAction: useCallback(
    (msg: {
      uuid: string;
      chat_uuid: string;
      content: string;
      kind: string;
      created_at: string;
      user: {
        uuid: string;
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
      } | null;
    }) => {
      if (msg.user?.uuid === currentUserUuid) return;

      setChats((prev) =>
        prev.map((c) =>
          c.uuid === msg.chat_uuid
            ? {
                ...c,
                unread_count: c.unread_count + 1,
                last_message: {
                  content: msg.content,
                  kind: msg.kind as "text" | "file" | "system" | "status_change",
                  created_at: msg.created_at as unknown as Date,
                  user: msg.user,
                },
              }
            : c,
        ),
      );
    },
    [currentUserUuid],
  ),
  onChatRemovedAction: useCallback(
    (payload: { event: "chat:removed"; chatUuid: string }) => {
      setChats((prev) => prev.filter((c) => c.uuid !== payload.chatUuid));
      if (
        typeof window !== "undefined" &&
        window.location.pathname.includes(payload.chatUuid)
      ) {
        router.push(basePath);
      }
    },
    [router, basePath],
  ),
  onChatUpdatedAction: useCallback(
    (payload: {
      event: "chat:updated";
      chatUuid: string;
      patch: Partial<{ is_muted: boolean; is_pinned: boolean }>;
    }) => {
      setChats((prev) =>
        prev.map((c) =>
          c.uuid === payload.chatUuid ? { ...c, ...payload.patch } : c,
        ),
      );
    },
    [],
  ),
  onChatCreatedAction: useCallback(
  () => {
      // Просто перезапросить список с сервера
      refreshChats();
    },
    [],
  ),
});

  async function refreshChats() {
    const res = await fetch("/api/chat/chats");
    if (res.ok) {
      const data = await res.json();
      setChats(data.data ?? []);
    }
  }

  function handleCreated(chatUuid: string) {
    setShowNewDialog(false);
    refreshChats();
    router.push(`${basePath}/${chatUuid}`);
  }

  async function openSaved() {
    const res = await fetch("/api/chat/chats/saved", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      router.push(`${basePath}/${data.data.uuid}`);
      refreshChats();
    }
  }

  async function handlePin(chat: ChatListItem) {
    const next = !chat.is_pinned;
    setChats((prev) =>
      prev.map((c) => (c.uuid === chat.uuid ? { ...c, is_pinned: next } : c)),
    );
    const res = await fetch(`/api/chat/chats/${chat.uuid}/pin`, {
      method: "POST",
    });
    if (!res.ok) {
      setChats((prev) =>
        prev.map((c) =>
          c.uuid === chat.uuid ? { ...c, is_pinned: !next } : c,
        ),
      );
    } else {
      refreshChats();
    }
  }

  async function handleMute(chat: ChatListItem) {
    const next = !chat.is_muted;
    setChats((prev) =>
      prev.map((c) => (c.uuid === chat.uuid ? { ...c, is_muted: next } : c)),
    );
    const res = await fetch(`/api/chat/chats/${chat.uuid}/mute`, {
      method: "POST",
    });
    if (!res.ok) {
      setChats((prev) =>
        prev.map((c) =>
          c.uuid === chat.uuid ? { ...c, is_muted: !next } : c,
        ),
      );
    }
  }

  async function handleMarkUnread(chat: ChatListItem) {
    setChats((prev) =>
      prev.map((c) =>
        c.uuid === chat.uuid
          ? { ...c, unread_count: Math.max(c.unread_count, 1) }
          : c,
      ),
    );
    const res = await fetch(`/api/chat/chats/${chat.uuid}/unread`, {
      method: "POST",
    });
    if (!res.ok) {
      setChats((prev) =>
        prev.map((c) =>
          c.uuid === chat.uuid ? { ...c, unread_count: chat.unread_count } : c,
        ),
      );
    }
  }

  async function handleMarkRead(chat: ChatListItem) {
    setChats((prev) =>
      prev.map((c) => (c.uuid === chat.uuid ? { ...c, unread_count: 0 } : c)),
    );
    const res = await fetch(`/api/chat/chats/${chat.uuid}/read`, {
      method: "POST",
    });
    if (!res.ok) {
      setChats((prev) =>
        prev.map((c) =>
          c.uuid === chat.uuid ? { ...c, unread_count: chat.unread_count } : c,
        ),
      );
    }
  }

  async function handleDelete(chat: ChatListItem) {
    if (!confirm(`Удалить чат «${chat.name ?? "без названия"}»?`)) return;
    const res = await fetch(`/api/chat/chats/${chat.uuid}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setChats((prev) => prev.filter((c) => c.uuid !== chat.uuid));
      if (typeof window !== "undefined" && window.location.pathname.includes(chat.uuid)) {
        router.push(basePath);
      }
    } else {
      const d = await res.json().catch(() => ({}));
      alert(typeof d.error === "string" ? d.error : "Не удалось удалить чат");
    }
  }

  async function handleLeave(chat: ChatListItem) {
    if (!confirm(`Покинуть чат «${chat.name ?? "без названия"}»?`)) return;
    const res = await fetch(`/api/chat/chats/${chat.uuid}/leave`, {
      method: "POST",
    });
    if (res.ok) {
      setChats((prev) => prev.filter((c) => c.uuid !== chat.uuid));
      if (
        typeof window !== "undefined" &&
        window.location.pathname.includes(chat.uuid)
      ) {
        router.push(basePath);
      }
    } else {
      const d = await res.json().catch(() => ({}));
      alert(typeof d.error === "string" ? d.error : "Не удалось покинуть чат");
    }
  }

  function handleChatClick(chat: ChatListItem) {
    // Локально сбрасываем бейдж сразу — не ждём ответа сервера
    if (chat.unread_count > 0) {
      setChats((prev) =>
        prev.map((c) => (c.uuid === chat.uuid ? { ...c, unread_count: 0 } : c)),
      );
    }
  }

  return (
    <>
      <ChatList
        chats={chats}
        currentUserUuid={currentUserUuid}
        basePath={basePath}
        onNewChatAction={() => setShowNewDialog(true)}
        onSavedAction={openSaved}
        onContextMenuAction={(chat, x, y) => setMenu({ chat, x, y })}
        onChatClickAction={handleChatClick}
      />

      {showNewDialog && (
        <NewChatDialog
          currentUserUuid={currentUserUuid}
          onCloseAction={() => setShowNewDialog(false)}
          onCreatedAction={handleCreated}
        />
      )}

      {menu && (
        <ChatContextMenu
          chat={menu.chat}
          x={menu.x}
          y={menu.y}
          onCloseAction={() => setMenu(null)}
          onPinAction={() => handlePin(menu.chat)}
          onMuteAction={() => handleMute(menu.chat)}
          onMarkReadAction={() => handleMarkRead(menu.chat)}
          onMarkUnreadAction={() => handleMarkUnread(menu.chat)}
          onDeleteAction={() => handleDelete(menu.chat)}
          onLeaveAction={() => handleLeave(menu.chat)}
        />
      )}
    </>
  );
}
