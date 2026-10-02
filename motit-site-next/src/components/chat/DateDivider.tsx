// src/components/chat/DateDivider.tsx
"use client";

import { ClientOnly } from "@/components/ClientOnly";
import { formatMessageDateDivider } from "@/lib/format-time";

export function DateDivider({ date }: { date: Date | string }) {
  return (
    <div className="flex justify-center my-3">
      <div className="px-3 py-1 rounded-full bg-(--bg-elevated) text-(--text-muted) text-[11px]">
        <ClientOnly>{formatMessageDateDivider(date)}</ClientOnly>
      </div>
    </div>
  );
}
