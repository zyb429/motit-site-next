// src/components/chat/ChatView.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { ChatWindow } from "./ChatWindow";
import { useChatSocket, type NewMessageHandler, type TypingHandler } from "@/hooks/useChatSocket";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import type { ChatMessageItem } from "@/lib/db/chat";

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

  const { signalTyping } = useTypingIndicator(currentUserUuid, chat.uuid);

  // Подписка на socket
  const chatUuids = useMemo(() => [chat.uuid], [chat.uuid]);

  useChatSocket({
    userUuid: currentUserUuid,
    chatUuids,
    onMessageAction: useCallback(
      (msg: Parameters<NewMessageHandler>[0]) => {
        // Игнорируем сообщения от себя (они уже добавлены при отправке)
        if (msg.user?.uuid === currentUserUuid) return;

        // Добавляем новое сообщение
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
          },
        ]);

        // Отмечаем прочитанным
        fetch(`/api/chat/chats/${chat.uuid}/read`, { method: "POST" }).catch(
          () => {},
        );
      },
      [chat.uuid, currentUserUuid],
    ),
    onTypingAction: useCallback(
      (payload: Parameters<TypingHandler>[0]) => {
        if (payload.userUuid === currentUserUuid) return;

        setTypingUsers((prev) => {
          if (payload.typing && !prev.includes(payload.userUuid)) {
            return [...prev, payload.userUuid];
          }
          if (!payload.typing) {
            return prev.filter((u) => u !== payload.userUuid);
          }
          return prev;
        });

        // Автосброс typing через 3 секунды (если не пришёл typing:stop)
        if (payload.typing) {
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== payload.userUuid));
          }, 3000);
        }
      },
      [currentUserUuid],
    ),
  });

  // Отправка сообщения
  const handleSend = useCallback(
    async (content: string) => {
      const res = await fetch(`/api/chat/chats/${chat.uuid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(typeof d.error === "string" ? d.error : "Ошибка");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, data.data]);
    },
    [chat.uuid],
  );

  return (
    <ChatWindow
      chat={chat}
      currentUserUuid={currentUserUuid}
      messages={messages}
      onSendMessageAction={handleSend}
      onTypingAction={signalTyping}
      typingUsers={typingUsers}
    />
  );
}
