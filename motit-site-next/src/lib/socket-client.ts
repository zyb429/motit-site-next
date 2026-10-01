"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentUuid: string | null = null;

export function getSocket(userUuid: string): Socket {
  // Защита: пустой uuid не должен пересоздавать сокет
  if (!userUuid) {
    if (socket) {
      console.warn("[socket] empty userUuid, returning existing socket");
      return socket;
    }
    throw new Error("[socket] empty userUuid and no existing socket");
  }

  if (socket && currentUuid === userUuid) return socket;

  console.log("[socket] recreating. Reason:", {
    noSocket: !socket,
    uuidChanged: socket && currentUuid !== userUuid,
    oldUuid: currentUuid,
    newUuid: userUuid,
  });

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentUuid = userUuid;
  socket = io(process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001", {
    auth: { userUuid },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  currentUuid = null;
}
