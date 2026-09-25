// src/hooks/useChatSocket.ts
"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket-client";

type NewMessageHandler = (msg: {
  uuid: string;
  chat_uuid: string;
  content: string;
  kind: string;
  created_at: string;
  user: { uuid: string; full_name: string | null; username: string | null } | null;
}) => void;

type TypingHandler = (payload: {
  chatUuid: string;
  userUuid: string;
  typing: boolean;
}) => void;

type PresenceHandler = (payload: {
  userUuid: string;
  status: "online" | "offline";
}) => void;

export function useChatSocket({
  userUuid,
  chatUuids,
  onMessage,
  onTyping,
  onPresence,
}: {
  userUuid: string;
  chatUuids: string[];
  onMessage?: NewMessageHandler;
  onTyping?: TypingHandler;
  onPresence?: PresenceHandler;
}) {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  useEffect(() => {
    const socket = getSocket(userUuid);
    socketRef.current = socket;

    const handleMessage: NewMessageHandler = (msg) => onMessage?.(msg);
    const handleTyping: TypingHandler = (p) => onTyping?.(p);
    const handlePresence: PresenceHandler = (p) => onPresence?.(p);

    socket.on("message:new", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("presence:update", handlePresence);

    chatUuids.forEach((uuid) => socket.emit("chat:join", uuid));

    return () => {
      chatUuids.forEach((uuid) => socket.emit("chat:leave", uuid));
      socket.off("message:new", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("presence:update", handlePresence);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUuid, chatUuids.join(",")]);

  return socketRef.current;
}
