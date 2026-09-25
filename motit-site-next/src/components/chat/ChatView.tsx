// src/components/chat/ChatView.tsx
"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { ChatWindow } from "./ChatWindow";
import { DeleteMessageDialog } from "./DeleteMessageDialog";
import { ForwardDialog } from "./ForwardDialog";
import {
  useChatSocket,
  type NewMessageHandler,
  type TypingHandler,
  type MessageReadHandler,
} from "@/hooks/useChatSocket";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import type {
  ChatListItem as ChatListItemType,
  ChatMessageItem,
} from "@/lib/db/chat";

type Chat = {
  uuid: string;
  kind: string;
  name: string | null;
  members: Array<{
    uuid: string;
    user: {
      uuid: string;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
  }>;
};

export function ChatView({
  chat,
  currentUserUuid,
  initialMessages,
}: {
  chat: Chat;
  currentUserUuid: string;
  initialMessages: ChatMessageItem[];
}) {
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<ChatMessageItem | null>(null);
  const [editing, setEditing] = useState<ChatMessageItem | null>(null);
  const [deleting, setDeleting] = useState<ChatMessageItem | null>(null);
  const [forwarding, setForwarding] = useState<ChatMessageItem | null>(null);
  const [chatList, setChatList] = useState<ChatListItemType[]>([]);

  const isSaved = chat.kind === "saved";

  const { signalTyping } = useTypingIndicator(currentUserUuid, chat.uuid);

  const markReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMarkedCountRef = useRef<number>(0);

  const markAsRead = useCallback(() => {
    if (typeof document !== "undefined" && !document.hasFocus()) return;
    if (messages.length <= lastMarkedCountRef.current) return;

    if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
    markReadTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/chat/chats/${chat.uuid}/read`, { method: "POST" });
        if (res.ok) lastMarkedCountRef.current = messages.length;
      } catch {}
    }, 400);
  }, [chat.uuid, messages.length]);

  useEffect(() => {
    if (isSaved) return;
    markAsRead();
    return () => {
      if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.uuid, isSaved]);

  useEffect(() => {
    const onFocus = () => markAsRead();
    const onVisible = () => {
      if (document.visibilityState === "visible") markAsRead();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [markAsRead]);

  const chatUuids = useMemo(() => [chat.uuid], [chat.uuid]);

  useChatSocket({
    userUuid: currentUserUuid,
    chatUuids,
    onMessageAction: useCallback(
      (msg: Parameters<NewMessageHandler>[0]) => {
        if (msg.user?.uuid === currentUserUuid) return;
        setMessages((prev) => [
          ...prev,
          {
            uuid: msg.uuid,
            chat_uuid: msg.chat_uuid,
            kind: msg.kind as ChatMessageItem["kind"],
            content: msg.content,
            reply_to_uuid: null,
            edited_at: null,
            deleted_at: null,
            created_at: msg.created_at as unknown as Date,
            user: msg.user,
            attachments: [],
            reactions: [],
            read_receipts: [],
            forwarded_from_message_uuid: null,
            forwarded_from_chat_uuid: null,
            forwarded_from_user_uuid: null,
          },
        ]);
        if (typeof document !== "undefined" && document.hasFocus()) markAsRead();
      },
      [currentUserUuid, markAsRead],
    ),
    onTypingAction: useCallback(
      (payload: Parameters<TypingHandler>[0]) => {
        if (payload.userUuid === currentUserUuid) return;
        setTypingUsers((prev) => {
          if (payload.typing && !prev.includes(payload.userUuid)) return [...prev, payload.userUuid];
          if (!payload.typing) return prev.filter((u) => u !== payload.userUuid);
          return prev;
        });
        if (payload.typing) {
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== payload.userUuid));
          }, 3000);
        }
      },
      [currentUserUuid],
    ),
    onReadAction: useCallback(
      (payload: Parameters<MessageReadHandler>[0]) => {
        if (payload.userUuid === currentUserUuid) return;
        setMessages((prev) =>
          prev.map((m) => {
            if (m.user?.uuid !== currentUserUuid) return m;
            const hasReceipt = m.read_receipts.some((r) => r.user_uuid === payload.userUuid);
            if (hasReceipt) return m;
            return {
              ...m,
              read_receipts: [
                ...m.read_receipts,
                { user_uuid: payload.userUuid, read_at: new Date(payload.readAt) },
              ],
            };
          }),
        );
      },
      [currentUserUuid],
    ),
    onDeletedAction: useCallback(
      (payload: { messageUuid: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.uuid === payload.messageUuid
              ? { ...m, deleted_at: new Date(), content: "" }
              : m,
          ),
        );
      },
      [],
    ),
  });

  const handleSend = useCallback(
    async (content: string) => {
      const res = await fetch(`/api/chat/chats/${chat.uuid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          replyToUuid: replyTo?.uuid,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(typeof d.error === "string" ? d.error : "Ошибка");
      }
      const data = await res.json();
      setMessages((prev) => [...prev, data.data]);
      lastMarkedCountRef.current = messages.length + 1;
      setReplyTo(null);
    },
    [chat.uuid, replyTo, messages.length],
  );

  const handleEditSubmit = useCallback(
    async (messageUuid: string, content: string) => {
      const res = await fetch(`/api/chat/messages/${messageUuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(typeof d.error === "string" ? d.error : "Ошибка");
      }
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) => (m.uuid === messageUuid ? data.data : m)),
      );
      setEditing(null);
    },
    [],
  );

  const handleDelete = useCallback(
    async (scope: "self" | "everyone") => {
      if (!deleting) return;

      const res = await fetch(
        `/api/chat/messages/${deleting.uuid}?scope=${scope}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        console.error("delete failed:", d);
        return;
      }

      if (scope === "self") {
        // Убираем из локального списка
        setMessages((prev) => prev.filter((m) => m.uuid !== deleting.uuid));
      }
      // Для scope="everyone" — обновление придёт через WebSocket (message:deleted)

      setDeleting(null);
    },
    [deleting],
  );

  const openForward = useCallback(
    async (message: ChatMessageItem) => {
      setForwarding(message);
      if (chatList.length === 0) {
        const res = await fetch("/api/chat/chats");
        if (res.ok) {
          const data = await res.json();
          setChatList(data.data ?? []);
        }
      }
    },
    [chatList.length],
  );

  const handleForward = useCallback(
    async (targetUuids: string[]) => {
      if (!forwarding) return;
      await fetch(`/api/chat/messages/${forwarding.uuid}/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetChatUuids: targetUuids }),
      });
      setForwarding(null);
    },
    [forwarding],
  );

  const handleCopy = useCallback((message: ChatMessageItem) => {
    navigator.clipboard.writeText(message.content).catch(() => {});
  }, []);

  const handleReact = useCallback(
    async (message: ChatMessageItem, emoji: string) => {
      const res = await fetch(`/api/chat/messages/${message.uuid}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) => (m.uuid === message.uuid ? { ...m, reactions: data.data } : m)),
      );
    },
    [],
  );

  return (
    <>
      <ChatWindow
        chat={chat}
        currentUserUuid={currentUserUuid}
        messages={messages}
        onSendMessageAction={handleSend}
        onTypingAction={signalTyping}
        typingUsers={typingUsers}
        replyTo={replyTo}
        onReplyAction={setReplyTo}
        onCancelReplyAction={() => setReplyTo(null)}
        editing={editing}
        onEditAction={setEditing}
        onCancelEditAction={() => setEditing(null)}
        onEditSubmitAction={handleEditSubmit}
        onDeleteAction={(message) => setDeleting(message)}
        onCopyAction={handleCopy}
        onReactAction={handleReact}
        onForwardAction={openForward}
      />

      {deleting && (
        <DeleteMessageDialog
          isOwn={deleting.user?.uuid === currentUserUuid}
          onCancelAction={() => setDeleting(null)}
          onDeleteAction={handleDelete}
        />
      )}

      {forwarding && (
        <ForwardDialog
          chats={chatList}
          currentUserUuid={currentUserUuid}
          onCloseAction={() => setForwarding(null)}
          onForwardAction={handleForward}
        />
      )}
    </>
  );
}
