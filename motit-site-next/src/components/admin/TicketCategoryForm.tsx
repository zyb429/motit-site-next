// src/components/admin/TicketCategoryForm.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";

interface CategoryInput {
  uuid: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  initial?: CategoryInput;
}

export function TicketCategoryForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function slugify(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 1) {
      setError("Укажите название");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug может содержать только a-z, 0-9 и дефис");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        icon: icon.trim() || null,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };

      const url = isEdit
        ? `/api/admin/ticket-categories/${initial!.uuid}`
        : "/api/admin/ticket-categories";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(
          typeof d.error === "string" ? d.error : "Не удалось сохранить",
        );
      }

      router.push("/admin/ticket-categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    if (!confirm(`Удалить категорию «${name}»?`)) return;

    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/ticket-categories/${initial!.uuid}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Не удалось удалить");
      }
      router.push("/admin/ticket-categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <Field label="Название *">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!isEdit && !slug) setSlug(slugify(e.target.value));
          }}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
        />
      </Field>

      <Field label="Slug (латиница, для URL) *">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) font-mono focus:border-(--accent) outline-none"
        />
      </Field>

      <Field label="Иконка (emoji)">
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          maxLength={4}
          className="w-24 px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) text-center focus:border-(--accent) outline-none"
        />
      </Field>

      <Field label="Описание">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none resize-y"
        />
      </Field>

      <Field label="Порядок сортировки">
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          min={0}
          className="w-32 px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
        />
      </Field>

      {isEdit && (
        <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-(--accent)"
          />
          Активна (показывать клиентам)
        </label>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-between gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Save size={16} />
          {saving ? "Сохранение…" : "Сохранить"}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} />
            Удалить
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-(--text-muted) mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
