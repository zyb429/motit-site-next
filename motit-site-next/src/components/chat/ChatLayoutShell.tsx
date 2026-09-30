// src/components/chat/ChatLayoutShell.tsx
"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

export function ChatLayoutShell({
  sidebar,
  children,
  basePath,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  basePath: string; // "/admin/chat" или "/cabinet/chat"
}) {
  const pathname = usePathname();

  // Открыт ли конкретный чат?
  // "/admin/chat"        → false (только список)
  // "/admin/chat/<uuid>" → true  (только чат)
  const isChatOpen =
    pathname !== basePath && pathname.startsWith(basePath + "/");

  return (
    <div className="flex-1 min-h-0 flex">
      {/* Список чатов — на мобилке скрыт, если открыт чат */}
      <aside
        className={`
          ${isChatOpen ? "hidden" : "flex"}
          lg:flex
          w-full lg:w-80 lg:shrink-0
          border-r border-(--border)
          h-full flex-col overflow-hidden
        `}
      >
        {sidebar}
      </aside>

      {/* Окно чата — на мобилке скрыто, если чат не открыт */}
      <main
        className={`
          ${isChatOpen ? "flex" : "hidden"}
          lg:flex
          flex-1 min-h-0 overflow-hidden flex-col
        `}
      >
        {children}
      </main>
    </div>
  );
}
