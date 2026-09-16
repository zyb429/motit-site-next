"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CategoryEditForm({
  initialCategory,
}: {
  initialCategory: any;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialCategory.name || "");
  const [slug, setSlug] = useState(initialCategory.slug || "");
  const [description, setDescription] = useState(
    initialCategory.description || "",
  );
  const [icon, setIcon] = useState(initialCategory.icon || "");
  const [error, setError] = useState<string | null>(null);

  const id = initialCategory.documentId || initialCategory.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              name: name.trim(),
              slug: slug.trim(),
              description: description || null,
              icon: icon || null,
            },
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || "Ошибка обновления");
        }

        router.push("/admin/categories");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка");
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm(`Удалить категорию «${name}»?`)) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Ошибка удаления");
        router.push("/admin/categories");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка");
      }
    });
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <Link
        href="/admin/categories"
        className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </Link>

      <h1 className="text-2xl font-bold mb-6">Редактирование категории</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={isPending}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Иконка
          </label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            disabled={isPending}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            maxLength={10}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex justify-between gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Сохранение..." : "Сохранить"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Удалить
          </button>
        </div>
      </form>
    </div>
  );
}
