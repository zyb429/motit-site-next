// src/hooks/useSidebarCollapsed.ts
"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Хук для управления состоянием свёрнутости сайдбара.
 * Сохраняет состояние в localStorage и cookie.
 * Возвращает кортеж [collapsed, toggle].
 */
export function useSidebarCollapsed(
  storageKey: string,
  initialCollapsed = false
): [boolean, () => void] {
  // Инициализируем состояние из initialCollapsed (для SSR)
  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);

  // При монтировании читаем актуальное значение из localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setCollapsed(stored === "1");
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Синхронизация между вкладками
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue !== null) {
        setCollapsed(e.newValue === "1");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey]);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      const value = next ? "1" : "0";
      
      try {
        // Сохраняем в localStorage
        localStorage.setItem(storageKey, value);
        
        // Сохраняем в cookie (на год)
        document.cookie = `${storageKey}=${value}; path=/; max-age=31536000; samesite=lax`;
      } catch {
        // ignore
      }
      
      return next;
    });
  }, [storageKey]);

  return [collapsed, toggle];
}