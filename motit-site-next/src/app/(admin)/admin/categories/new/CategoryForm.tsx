// src/app/(admin)/admin/categories/new/CategoryForm.tsx
"use client";

import type { SyntheticEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { generateSlug } from "@/lib/utils";

export default function CategoryForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugManuallyEdited(value.length > 0);
  };

  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    setError(null);

    const finalSlug = slug || generateSlug(name);
    if (!name.trim()) {
      setError("Укажите название");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              name: name.trim(),
              slug: finalSlug,
              description: description || null,
              icon: icon || null,
            },
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.error?.message || err.error || "Ошибка создания категории",
          );
        }

        router.push("/admin/categories");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка");
      }
    });
  };

  // Используем общие классы для всех полей ввода
  const inputClass =
    "w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none transition-colors text-sm";

  return (
    <div className="grid w-full place-items-center px-4 py-6">
      <div className="w-full max-w-2xl">
        <Link
          href="/admin/categories"
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-2 mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к категориям
        </Link>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          Новая категория
        </h1>

        {/* Убраны инлайн-стили, используется класс bg-[var(--bg-card)] */}
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 space-y-5 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isPending}
              className={inputClass}
              placeholder="Например: Технологии"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Slug (URL)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={isPending}
              className={`${inputClass} font-mono`}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              Генерируется автоматически из названия. Можно изменить вручную.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              className={inputClass}
              rows={3}
              placeholder="Краткое описание категории..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Иконка (эмодзи)
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={isPending}
              className={inputClass}
              maxLength={10}
              placeholder="📚"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Разносим кнопки по краям (как в редактировании) */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Сохранение..." : "Создать категорию"}
            </button>
            
            {/* Кнопка "Отмена" с такими же размерами, как "Удалить" в редактировании */}
            <Link
              href="/admin/categories"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[var(--text-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--border)] transition-colors font-medium text-sm min-w-[120px]"
            >
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}