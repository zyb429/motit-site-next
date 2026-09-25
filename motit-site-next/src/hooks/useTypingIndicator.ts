// src/hooks/useTypingIndicator.ts
"use client";

import { useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket-client";

export function useTypingIndicator(
  userUuid: string,
  chatUuid: string,
  delay = 2000,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const signalTyping = useCallback(() => {
    const socket = getSocket(userUuid);

    if (!isTypingRef.current) {
      socket.emit("typing:start", { chatUuid });
      isTypingRef.current = true;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      socket.emit("typing:stop", { chatUuid });
      isTypingRef.current = false;
    }, delay);
  }, [userUuid, chatUuid, delay]);

  const stopTyping = useCallback(() => {
    const socket = getSocket(userUuid);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isTypingRef.current) {
      socket.emit("typing:stop", { chatUuid });
      isTypingRef.current = false;
    }
  }, [userUuid, chatUuid]);

  return { signalTyping, stopTyping };
}
