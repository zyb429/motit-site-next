"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(userUuid: string): Socket {
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001", {
    auth: { userUuid },
    transports: ["websocket"],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
