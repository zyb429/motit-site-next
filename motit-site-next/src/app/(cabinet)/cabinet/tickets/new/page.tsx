// src/app/(cabinet)/cabinet/tickets/new/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listTicketCategories } from "@/lib/db/ticket-categories";

export const dynamic = "force-dynamic";

export default async function NewTicketCategoryPage() {
  const categories = await listTicketCategories();

  return (
    <div className="p-8 w-full max-w-2xl mx-auto">
      <Link
        href="/cabinet/tickets"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#2dd4bf] transition-colors"
      >
        <ArrowLeft size={14} />
        К списку обращений
      </Link>

      <h1 className="text-2xl font-bold text-[#e0f7fa] mt-4">
        Новое обращение
      </h1>
      <p className="text-gray-400 text-sm mt-1">
        Выберите категорию, к которой относится ваш вопрос
      </p>

      {categories.length === 0 ? (
        <div className="mt-8 text-center py-16 border border-dashed border-[rgba(45,212,191,0.15)] rounded-xl text-gray-500">
          Категории ещё не созданы. Обратитесь к администратору.
        </div>
      ) : (
        <ul className="mt-8 space-y-2">
          {categories.map((cat) => (
            <li key={cat.uuid}>
              <Link
                href={`/account/tickets/new/${cat.slug}`}
                className="block p-4 rounded-xl bg-[#0f2832] border border-[rgba(45,212,191,0.08)] hover:border-[#2dd4bf]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {cat.icon && <span className="text-xl">{cat.icon}</span>}
                  <div>
                    <div className="text-[#e0f7fa] font-medium">
                      {cat.name}
                    </div>
                    {cat.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {cat.description}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
