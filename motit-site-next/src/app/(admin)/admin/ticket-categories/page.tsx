// src/app/(admin)/admin/ticket-categories/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { listTicketCategories } from "@/lib/db/ticket-categories";

export const dynamic = "force-dynamic";

export default async function AdminTicketCategoriesPage() {
  const categories = await listTicketCategories({ includeInactive: true });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">
            Категории обращений
          </h1>
          <p className="text-sm text-(--text-muted) mt-1">
            Всего: {categories.length}
          </p>
        </div>
        <Link
          href="/admin/ticket-categories/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} />
          Новая категория
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-(--border) rounded-xl text-(--text-muted)">
          Категорий пока нет
        </div>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.uuid}>
              <Link
                href={`/admin/ticket-categories/${c.uuid}`}
                className="flex items-center justify-between p-4 rounded-xl bg-(--bg-card) border border-(--border) hover:border-(--accent)/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {c.icon && <span className="text-xl">{c.icon}</span>}
                  <div className="min-w-0">
                    <div className="text-(--text-primary) font-medium truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-(--text-muted)">
                      /{c.slug} · тикетов: {c._count.tickets}
                      {!c.is_active && " · скрыта"}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-(--text-muted)">
                  #{c.sort_order}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
