// src/app/(cabinet)/cabinet/tickets/new/page.tsx
import Link from "next/link";
import { ArrowLeft, ChevronRight, MessageSquare } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listTicketCategories } from "@/lib/db/ticket-categories";

export const dynamic = "force-dynamic";

export default async function NewTicketCategoryPage() {
  const user = await getCurrentUser();
  const categories = await listTicketCategories({ role: user?.role ?? undefined });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-(--bg-primary)">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/cabinet/tickets"
            className="inline-flex items-center gap-1.5 text-sm text-(--text-muted) hover:text-(--accent) transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            К списку обращений
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary) tracking-tight">
            Новое обращение
          </h1>
          <p className="text-sm text-(--text-muted) mt-1.5 mb-6 sm:mb-8">
            Выберите категорию, к которой относится ваш вопрос
          </p>

          {categories.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-(--border) rounded-3xl bg-(--bg-card)/50">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-(--bg-secondary) flex items-center justify-center">
                <MessageSquare size={28} className="text-(--text-muted) opacity-50" />
              </div>
              <p className="text-base font-semibold text-(--text-primary) mb-1">
                Категории ещё не созданы
              </p>
              <p className="text-sm text-(--text-muted)">
                Обратитесь к администратору
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.uuid}>
                  <Link
                    href={`/cabinet/tickets/new/${cat.slug}`}
                    className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-(--bg-card) border border-(--border) hover:border-(--accent)/40 hover:shadow-md active:scale-[0.995] transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-(--accent-dim) flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {cat.icon ? (
                        <span className="text-xl sm:text-2xl">{cat.icon}</span>
                      ) : (
                        <MessageSquare size={20} className="text-(--accent)" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-(--text-primary) group-hover:text-(--accent) transition-colors">
                        {cat.name}
                      </div>
                      {cat.description && (
                        <div className="text-sm text-(--text-muted) mt-0.5 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </div>
                      )}
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-(--text-muted) group-hover:text-(--accent) group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}