// src/components/chat/ChatWindow.tsx
"use client";

import { ChatHeader } from "./ChatHeader";
import type { ChatMessageItem } from "@/lib/db/chat";

type ChatWindowProps = {
  chat: {
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
  currentUserUuid: string;
  messages: ChatMessageItem[];
  onSendMessageAction: (content: string) => Promise<void>;
  onTypingAction?: () => void;
  isOnlineAction?: (userUuid: string) => boolean;
  typingUsers?: string[];
};

export function ChatWindow({
  chat,
  currentUserUuid,
  messages,
  onSendMessageAction,
  onTypingAction,
  isOnlineAction,
  typingUsers = [],
}: ChatWindowProps) {
  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        chat={chat}
        currentUserUuid={currentUserUuid}
        isOnlineAction={isOnlineAction}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-sm text-(--text-muted)">
            Сообщений пока нет. Начните первым!
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.uuid}
                className={`text-sm p-2 rounded-lg ${
                  m.user?.uuid === currentUserUuid
                    ? "bg-(--accent-dim) ml-auto max-w-md"
                    : "bg-(--bg-primary) mr-auto max-w-md"
                }`}
              >
                {m.user && m.user.uuid !== currentUserUuid && (
                  <div className="text-xs text-(--text-muted) mb-0.5">
                    {m.user.full_name ?? m.user.username ?? "—"}
                  </div>
                )}
                <div className="text-(--text-primary) whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Typing indicator placeholder */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-(--text-muted) italic">
          {typingUsers.length === 1
            ? "Кто-то печатает…"
            : `${typingUsers.length} человек печатают…`}
        </div>
      )}

      {/* Input placeholder — заменим в 5.2b */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const input = form.elements.namedItem("msg") as HTMLInputElement;
          const value = input.value.trim();
          if (!value) return;
          await onSendMessageAction(value);
          input.value = "";
        }}
        className="p-3 border-t border-(--border) bg-(--bg-card)"
      >
        <input
          name="msg"
          type="text"
          placeholder="Написать сообщение…"
          onInput={onTypingAction}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-sm text-(--text-primary) focus:border-(--accent) outline-none"
        />
      </form>
    </div>
  );
}
