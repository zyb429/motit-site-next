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

  const inputClass =
    "w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors";

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <Link
        href="/admin/categories"
        className="text-(--text-muted) hover:text-(--text-primary) flex items-center gap-2 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </Link>

      <h1 className="text-2xl font-bold text-(--text-primary) mb-6">
        Новая категория
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-(--bg-card) rounded-xl shadow-sm border border-(--border) p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-(--text-primary) mb-1">
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
          <label className="block text-sm font-medium text-(--text-primary) mb-1">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            disabled={isPending}
            className={`${inputClass} font-mono`}
          />
          <p className="text-xs text-(--text-muted) mt-1">
            Генерируется автоматически из названия. Можно изменить вручную.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-(--text-primary) mb-1">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            className={inputClass}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-(--text-primary) mb-1">
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
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 bg-(--accent) text-(--bg-primary) rounded-lg hover:bg-(--accent-hover) disabled:opacity-50 flex items-center gap-2 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Сохранение..." : "Создать"}
          </button>
          <Link
            href="/admin/categories"
            className="px-6 py-2 text-(--text-secondary) hover:bg-(--bg-secondary) rounded-lg transition-colors"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
