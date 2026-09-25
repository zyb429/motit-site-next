// src/components/chat/EmojiPickerButton.tsx
"use client";

import { useState, lazy, Suspense, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Smile } from "lucide-react";
import { Theme } from "emoji-picker-react";

// Lazy-загрузка picker — не тянем 300 КБ в основной бандл
const Picker = lazy(() => import("emoji-picker-react"));

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function EmojiPickerButton({
  onEmojiAction,
  variant = "input",
}: {
  /** Callback при выборе эмодзи */
  onEmojiAction: (emoji: string) => void;
  /** "input" — маленькая кнопка рядом с полем ввода
   *  "menu" — компактная кнопка внутри контекстного меню */
  variant?: "input" | "menu";
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Тема из next-themes — совпадает с тем, что использует ThemeToggle
  const { resolvedTheme } = useTheme();
  const mounted = useIsMounted();
  const isDark = mounted && resolvedTheme === "dark";

  // Закрытие по клику вне и Escape
  useEffect(() => {
    if (!open) return;

    function onClickOutside(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handlePick(emoji: string) {
    onEmojiAction(emoji);
    setOpen(false);
  }

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          variant === "input"
            ? "p-2 rounded-lg text-(--text-muted) hover:text-(--accent) hover:bg-(--bg-primary) transition-colors"
            : "w-8 h-8 rounded-lg hover:bg-(--bg-primary) flex items-center justify-center text-(--text-muted)"
        }
        title="Эмодзи"
      >
        <Smile size={variant === "input" ? 18 : 16} />
      </button>

      {open && (
        <div
          ref={pickerRef}
          className="absolute bottom-full mb-2 left-0 z-130"
        >
          <Suspense
            fallback={
              <div className="bg-(--bg-card) border border-(--border) rounded-xl p-4 text-xs text-(--text-muted) shadow-2xl">
                Загрузка пикера…
              </div>
            }
          >
            <Picker
              onEmojiClick={(e) => handlePick(e.emoji)}
              theme={isDark ? Theme.DARK : Theme.LIGHT}
              lazyLoadEmojis
              searchPlaceHolder="Поиск эмодзи…"
              previewConfig={{ showPreview: false }}
              height={400}
              width={320}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
