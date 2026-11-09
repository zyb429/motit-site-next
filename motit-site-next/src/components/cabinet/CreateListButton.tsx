// src/components/cabinet/CreateListButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, X } from "lucide-react";

export function CreateListButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Блокировка скролла при открытии
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Анимация появления
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setMounted(true), 10);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (res.ok) {
        setName("");
        setIsOpen(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Не удалось создать список");
      }
    } catch {
      setError("Произошла ошибка при создании");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--accent) text-(--bg-primary) text-sm font-medium hover:bg-(--accent-hover) active:scale-95 transition-all shadow-sm"
      >
        <Plus size={16} />
        Создать список
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Подложка */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
          />

          {/* Контент модалки (как в AddToListModal) */}
          <div
            className={`relative w-full max-w-md bg-(--bg-card) border border-(--border) shadow-2xl flex flex-col transition-all duration-300 ease-out ${
              mounted
                ? "translate-y-0 sm:scale-100 opacity-100"
                : "translate-y-full sm:translate-y-4 sm:scale-95 opacity-0"
            } rounded-t-2xl sm:rounded-xl max-h-[85vh] sm:max-h-[80vh]`}
          >
            {/* Ручка для свайпа (мобилки) */}
            <div className="w-12 h-1.5 bg-(--border) rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

            {/* Хедер */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-(--border) shrink-0">
              <h3 className="font-semibold text-(--text-primary) text-base sm:text-lg">
                Новый список
              </h3>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-(--text-muted) hover:bg-(--bg-secondary) hover:text-(--text-primary) transition-colors"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            {/* Тело */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              <label className="block text-sm font-medium text-(--text-primary) mb-1.5">
                Название списка
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="Например: На выходные..."
                maxLength={100}
                autoFocus
                className="w-full px-3 py-2.5 bg-(--bg-primary) border border-(--border) rounded-lg text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent) focus:ring-1 focus:ring-(--accent) outline-none transition-all text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
              {error && (
                <p className="text-red-400 text-xs mt-2">{error}</p>
              )}
            </div>

            {/* Футер */}
            <div className="p-3 sm:p-4 border-t border-(--border) bg-(--bg-secondary)/30 shrink-0 pb-safe">
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 sm:py-2.5 rounded-xl bg-(--accent) text-(--bg-primary) text-sm font-semibold hover:bg-(--accent-hover) active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Создать"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}