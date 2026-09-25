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
}) => void;

export function useChatSocket({
  userUuid,
  chatUuids,
  onMessageAction,
  onTypingAction,
  onPresenceAction,
  onReadAction,
  onDeletedAction,
}: {
  userUuid: string;
  chatUuids: string[];
  onMessageAction?: NewMessageHandler;
  onTypingAction?: TypingHandler;
  onPresenceAction?: PresenceHandler;
  onReadAction?: MessageReadHandler;
  onDeletedAction?: MessageDeletedHandler;
}) {
  useEffect(() => {
    const socket = getSocket(userUuid);

    const handleMessage: NewMessageHandler = (msg) => onMessageAction?.(msg);
    const handleTyping: TypingHandler = (p) => onTypingAction?.(p);
    const handlePresence: PresenceHandler = (p) => onPresenceAction?.(p);
    const handleRead: MessageReadHandler = (p) => onReadAction?.(p);
    const handleDeleted: MessageDeletedHandler = (p) => onDeletedAction?.(p);

    socket.on("message:new", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("presence:update", handlePresence);
    socket.on("message:read", handleRead);
    socket.on("message:deleted", handleDeleted);

    chatUuids.forEach((uuid) => socket.emit("chat:join", uuid));

    return () => {
      chatUuids.forEach((uuid) => socket.emit("chat:leave", uuid));
      socket.off("message:new", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("presence:update", handlePresence);
      socket.off("message:read", handleRead);
      socket.off("message:deleted", handleDeleted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUuid, chatUuids.join(",")]);
}
