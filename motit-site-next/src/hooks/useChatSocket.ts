// src/hooks/useChatSocket.ts
"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket-client";

export type NewMessageHandler = (msg: {
  uuid: string;
  chat_uuid: string;
  content: string;
  kind: string;
  created_at: string;
  reply_to_uuid?: string | null;
  forwarded_from_message_uuid?: string | null;
  forwarded_from_chat_uuid?: string | null;
  forwarded_from_user_uuid?: string | null;
  attachments?: Array<{
    uuid: string;
    file: {
      id: number;
      uuid: string;
      name: string;
      url: string;
      mime: string | null;
      size: number | null;
    };
  }>;
  user: {
    uuid: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}) => void;

export type TypingHandler = (payload: {
  chatUuid: string;
  userUuid: string;
  typing: boolean;
}) => void;

export type PresenceHandler = (payload: {
  userUuid: string;
  status: "online" | "offline";
}) => void;

export type MessageReadHandler = (payload: {
  chatUuid: string;
  userUuid: string;
  readAt: string;
}) => void;

export type MessageDeletedHandler = (payload: {
  messageUuid: string;
  deletedBy?: { uuid: string; full_name: string | null; username: string | null };
}) => void;

export type ChatRemovedHandler = (payload: {
  event: "chat:removed";
  chatUuid: string;
}) => void;

export type ChatUpdatedHandler = (payload: {
  event: "chat:updated";
  chatUuid: string;
  patch: Partial<{ is_muted: boolean; is_pinned: boolean }>;
}) => void;

export function useChatSocket({
  userUuid,
  chatUuids,
  onMessageAction,
  onTypingAction,
  onPresenceAction,
  onReadAction,
  onDeletedAction,
  onChatRemovedAction,
  onChatUpdatedAction,
}: {
  userUuid: string;
  chatUuids: string[];
  onMessageAction?: NewMessageHandler;
  onTypingAction?: TypingHandler;
  onPresenceAction?: PresenceHandler;
  onReadAction?: MessageReadHandler;
  onDeletedAction?: MessageDeletedHandler;
  onChatRemovedAction?: ChatRemovedHandler;
  onChatUpdatedAction?: ChatUpdatedHandler;
}) {
  useEffect(() => {
    const socket = getSocket(userUuid);

    const handleMessage: NewMessageHandler = (msg) => onMessageAction?.(msg);
    const handleTyping: TypingHandler = (p) => onTypingAction?.(p);
    const handlePresence: PresenceHandler = (p) => onPresenceAction?.(p);
    const handleRead: MessageReadHandler = (p) => onReadAction?.(p);
    const handleDeleted: MessageDeletedHandler = (p) => onDeletedAction?.(p);
    const handleChatRemoved: ChatRemovedHandler = (p) => onChatRemovedAction?.(p);
    const handleChatUpdated: ChatUpdatedHandler = (p) => onChatUpdatedAction?.(p);

    socket.on("message:new", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("presence:update", handlePresence);
    socket.on("message:read", handleRead);
    socket.on("message:deleted", handleDeleted);
    socket.on("chat:removed", handleChatRemoved);
    socket.on("chat:updated", handleChatUpdated);

    const join = () => {
      chatUuids.forEach((uuid) => socket.emit("chat:join", uuid));
    };

    if (socket.connected) join();
    socket.on("connect", join);

    return () => {
      socket.off("connect", join);
      chatUuids.forEach((uuid) => socket.emit("chat:leave", uuid));
      socket.off("message:new", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("presence:update", handlePresence);
      socket.off("message:read", handleRead);
      socket.off("message:deleted", handleDeleted);
      socket.off("chat:removed", handleChatRemoved);
      socket.off("chat:updated", handleChatUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUuid, chatUuids.join(",")]);
}
