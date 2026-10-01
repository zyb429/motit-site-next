// src/hooks/usePresence.ts
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket-client";

export function usePresence(userUuid: string) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const socket = getSocket(userUuid);

    const handlePresence = (payload: {
      userUuid: string;
      status: "online" | "offline";
    }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (payload.status === "online") next.add(payload.userUuid);
        else next.delete(payload.userUuid);
        return next;
      });
    };

    socket.on("presence:update", handlePresence);
    return () => {
      socket.off("presence:update", handlePresence);
    };
  }, [userUuid]);

  return {
    isOnline: (uuid: string) => onlineUsers.has(uuid),
  };
}
