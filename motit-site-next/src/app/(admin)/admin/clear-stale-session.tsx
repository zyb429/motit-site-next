// src/app/(admin)/admin/clear-stale-session.tsx
"use client";

import { useEffect } from "react";
import { clearStaleSessionAction } from "./clear-stale-session-action";

export function ClearStaleSession({ from = "/admin" }: { from?: string }) {
  useEffect(() => {
    void clearStaleSessionAction(from);
  }, [from]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm opacity-70">
      Очищаем сессию…
    </div>
  );
}
