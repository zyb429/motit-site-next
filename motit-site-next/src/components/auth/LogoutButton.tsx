// src/components/auth/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

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
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("[LogoutButton] error:", err);
    }
    router.push("/login");
    router.refresh();
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        title="Выйти"
        aria-label="Выйти"
        className={`w-10 h-10 flex items-center justify-center rounded-lg text-(--text-muted) hover:text-red-400 hover:bg-red-500/10 transition-colors ${className}`}
      >
        <LogOut size={18} />
      </button>
    );
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-(--text-muted) hover:text-red-400 hover:bg-red-500/10 transition-colors w-full ${className}`}
      >
        <LogOut size={16} />
        <span>Выйти</span>
      </button>
    );
  }

  // default — обратная совместимость
  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ||
        "flex items-center gap-2 text-xs text-(--text-muted) hover:text-(--accent) transition-colors"
      }
    >
      <LogOut size={14} />
      Выйти
    </button>
  );
}
