// src/components/chat/ChatWindow.tsx
"use client";

import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
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
  onLoadMoreAction?: () => void;
  hasMore?: boolean;
  isOnlineAction?: (userUuid: string) => boolean;
  typingUsers?: string[];
  // Управление сообщениями
  replyTo?: ChatMessageItem | null;
  onReplyAction?: (message: ChatMessageItem) => void;
  onCancelReplyAction?: () => void;
  editing?: ChatMessageItem | null;
  onEditAction?: (message: ChatMessageItem) => void;
  onCancelEditAction?: () => void;
  onEditSubmitAction?: (messageUuid: string, content: string) => Promise<void>;
  onDeleteAction?: (message: ChatMessageItem) => void;
  onCopyAction?: (message: ChatMessageItem) => void;
  onReactAction?: (message: ChatMessageItem, emoji: string) => void;
  onForwardAction?: (message: ChatMessageItem) => void;
};

export function ChatWindow({
  chat,
  currentUserUuid,
  messages,
  onSendMessageAction,
  onTypingAction,
  onLoadMoreAction,
  hasMore,
  isOnlineAction,
  typingUsers = [],
  replyTo,
  onReplyAction,
  onCancelReplyAction,
  editing,
  onEditAction,
  onCancelEditAction,
  onEditSubmitAction,
  onDeleteAction,
  onCopyAction,
  onReactAction,
  onForwardAction,
}: ChatWindowProps) {
  const typingNames = typingUsers
    .filter((uuid) => uuid !== currentUserUuid)
    .map((uuid) => {
      const m = chat.members.find((m) => m.user.uuid === uuid);
      return m?.user.full_name ?? m?.user.username ?? "Кто-то";
    });

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        chat={chat}
        currentUserUuid={currentUserUuid}
        isOnlineAction={isOnlineAction}
      />

      <MessageList
        messages={messages}
        currentUserUuid={currentUserUuid}
        onLoadMoreAction={onLoadMoreAction}
        hasMore={hasMore}
        onReplyAction={onReplyAction}
        onCopyAction={onCopyAction}
        onEditAction={onEditAction}
        onDeleteAction={onDeleteAction}
        onReactAction={onReactAction}
        onForwardAction={onForwardAction}
      />

      <TypingIndicator names={typingNames} />

      <MessageInput
        key={editing?.uuid ?? "new"}
        onSendMessageAction={onSendMessageAction}
        onTypingAction={onTypingAction}
        replyTo={replyTo}
        onCancelReplyAction={onCancelReplyAction}
        editing={editing}
        onCancelEditAction={onCancelEditAction}
        onEditSubmitAction={onEditSubmitAction}
      />
    </div>
  );
}
