// src/components/ui/ThemeForce.tsx
"use client";

import { useEffect } from "react";

/**
 * Принудительно ставит класс темы на <html>, НЕ трогая next-themes.
 * Используется вне админки, чтобы страницы всегда были тёмными,
 * независимо от выбора пользователя в админке.
 */
export function ThemeForce({ theme }: { theme: "light" | "dark" }) {
  useEffect(() => {
    const html = document.documentElement;
    const hadDark = html.classList.contains("dark");

    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    return () => {
      if (hadDark) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    };
  }, [theme]);

  return null;
}
