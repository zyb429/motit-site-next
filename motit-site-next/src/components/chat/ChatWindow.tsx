// src/components/chat/ChatWindow.tsx
"use client";

import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessageItem, PinnedMessageItem } from "@/lib/db/chat";
import type { PreviewFile } from "./MediaPreviewModal";
import { PinnedBanner } from "./PinnedBanner";

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
  onPreviewFileAction?: (file: PreviewFile, allFiles: PreviewFile[]) => void;

  replyTo?: ChatMessageItem | null;
  onReplyAction?: (message: ChatMessageItem) => void;
  onCancelReplyAction?: () => void;
  editing?: ChatMessageItem | null;
  onEditAction?: (message: ChatMessageItem) => void;
  onCancelEditAction?: () => void;
  onEditSubmitAction?: (messageUuid: string, content: string) => Promise<void>;
  onDeleteAction?: (message: ChatMessageItem, scope: "self" | "everyone") => void;
  onCopyAction?: (message: ChatMessageItem) => void;
  onReactAction?: (message: ChatMessageItem, emoji: string) => void;
  onForwardAction?: (message: ChatMessageItem) => void;
  onPinAction?: (message: ChatMessageItem, scope: "self" | "everyone") => void;
  onAttachAction?: (files: File[], content: string) => Promise<void>;
  inputDisabled?: boolean;
  pinned?: PinnedMessageItem[];
  pinnedUuids?: Set<string>;
  onJumpToPinnedAction?: (messageUuid: string) => void;
  onUnpinAction?: (messageUuid: string, scope: "self" | "everyone") => void;

  onChatInfoAction?: () => void;
  onChatSettingsAction?: () => void;
  onChatAddMembersAction?: () => void;
  onChatToggleMuteAction?: () => void;
  onChatLeaveAction?: () => void;
  onChatDeleteAction?: () => void;
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
  onPinAction,
  onAttachAction,
  inputDisabled,
  onPreviewFileAction,
  pinned,
  pinnedUuids,
  onJumpToPinnedAction,
  onUnpinAction,
  onChatInfoAction,
  onChatSettingsAction,
  onChatAddMembersAction,
  onChatToggleMuteAction,
  onChatLeaveAction,
  onChatDeleteAction,
}: ChatWindowProps) {
  const typingNames = typingUsers
    .filter((uuid) => uuid !== currentUserUuid)
    .map((uuid) => {
      const m = chat.members.find((m) => m.user.uuid === uuid);
      return m?.user.full_name ?? m?.user.username ?? "Кто-то";
    });

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <ChatHeader
        chat={chat}
        currentUserUuid={currentUserUuid}
        isOnlineAction={isOnlineAction}
        onInfoAction={onChatInfoAction}
        onSettingsAction={onChatSettingsAction}
        onAddMembersAction={onChatAddMembersAction}
        onToggleMuteAction={onChatToggleMuteAction}
        onLeaveAction={onChatLeaveAction}
        onDeleteAction={onChatDeleteAction}
      />

      {pinned && pinned.length > 0 && onJumpToPinnedAction && onUnpinAction && (
        <PinnedBanner
          pinned={pinned}
          onJumpAction={onJumpToPinnedAction}
          onUnpinAction={onUnpinAction}
        />
      )}

      <MessageList
        messages={messages}
        currentUserUuid={currentUserUuid}
        onLoadMoreAction={onLoadMoreAction}
        hasMore={hasMore}
        pinnedUuids={pinnedUuids}
        onReplyAction={onReplyAction}
        onCopyAction={onCopyAction}
        onEditAction={onEditAction}
        onDeleteAction={onDeleteAction}
        onReactAction={onReactAction}
        onForwardAction={onForwardAction}
        onPinAction={onPinAction}
        onPreviewFileAction={onPreviewFileAction}
      />

      <TypingIndicator names={typingNames} />

      <MessageInput
        key={editing?.uuid ?? "new"}
        onSendMessageAction={onSendMessageAction}
        onAttachAction={onAttachAction}
        onTypingAction={onTypingAction}
        replyTo={replyTo}
        onCancelReplyAction={onCancelReplyAction}
        editing={editing}
        onCancelEditAction={onCancelEditAction}
        onEditSubmitAction={onEditSubmitAction}
        disabled={inputDisabled}
      />
    </div>
  );
}
