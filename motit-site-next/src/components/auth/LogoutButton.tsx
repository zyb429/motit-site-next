// src/components/auth/LogoutButton.tsx
"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface LogoutButtonProps {
  /**
   * Режим отображения:
   * - "full"    — иконка + текст «Выйти» (для развёрнутого sidebar'а)
   * - "icon"    — только иконка, по центру (для свёрнутого sidebar'а)
   * - "default" — минимальная ссылка (обратная совместимость)
   */
  variant?: "full" | "icon" | "default";
  className?: string;
}

export function LogoutButton({
  variant = "default",
  className = "",
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction(); // редирект сделает сам signOut через NEXT_REDIRECT
    });
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        title="Выйти"
        aria-label="Выйти"
        className={`w-10 h-10 flex items-center justify-center rounded-lg text-(--text-muted) hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 ${className}`}
      >
        {isPending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <LogOut size={18} />
        )}
      </button>
    );
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-(--text-muted) hover:text-red-400 hover:bg-red-500/10 transition-colors w-full disabled:opacity-50 ${className}`}
      >
        {isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <LogOut size={16} />
        )}
        <span>Выйти</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={
        className ||
        "flex items-center gap-2 text-xs text-(--text-muted) hover:text-(--accent) transition-colors disabled:opacity-50"
      }
    >
      {isPending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <LogOut size={14} />
      )}
      Выйти
    </button>
  );
}
