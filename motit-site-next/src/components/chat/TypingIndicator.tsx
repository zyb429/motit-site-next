// src/components/chat/TypingIndicator.tsx
"use client";

export function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;

  return (
    <div className="px-4 py-1 text-xs text-(--text-muted) italic flex items-center gap-1">
      <span className="inline-flex gap-0.5">
        <span className="animate-bounce">·</span>
        <span className="animate-bounce" style={{ animationDelay: "0.15s" }}>
          ·
        </span>
        <span className="animate-bounce" style={{ animationDelay: "0.3s" }}>
          ·
        </span>
      </span>
      <span>
        {names.length === 1
          ? `${names[0]} печатает…`
          : `${names.slice(0, 2).join(", ")}${names.length > 2 ? ` и ещё ${names.length - 2}` : ""} печатают…`}
      </span>
    </div>
  );
}
