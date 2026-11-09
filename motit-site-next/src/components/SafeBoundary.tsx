// src/components/SafeBoundary.tsx
"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SafeBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    // Проверяем текст ошибки
    const msg = error.message || "";
    if (
      msg.includes("Permission denied to access property") ||
      msg.includes("correspondingUseElement") ||
      msg.includes("nodeType")
    ) {
      // Возвращаем false, чтобы компонент НЕ показывал fallback,
      // а просто продолжил рендерить детей (игнорируем ошибку)
      console.warn("[SafeBoundary] Игнорируем ошибку расширения:", msg);
      return { hasError: false }; 
    }
    // Остальные ошибки пробрасываем дальше
    throw error;
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const msg = error.message || "";
    if (
      msg.includes("Permission denied to access property") ||
      msg.includes("correspondingUseElement") ||
      msg.includes("nodeType")
    ) {
      // Просто логируем в консоль, но не ломаем приложение
      console.warn("[SafeBoundary] Перехвачена ошибка DOM:", msg);
    } else {
      console.error("[SafeBoundary] Необработанная ошибка:", error, errorInfo);
    }
  }

  public render() {
    // Всегда рендерим детей, даже если была ошибка (так как мы её игнорируем)
    return this.props.children;
  }
}