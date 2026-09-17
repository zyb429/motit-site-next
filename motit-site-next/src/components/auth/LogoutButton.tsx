// src/components/auth/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({ className = "" }: { className?: string }) {
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
