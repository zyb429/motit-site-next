// src/app/(cabinet)/cabinet/tickets/page.tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/helpdesk/StatusBadge";
import { PriorityBadge } from "@/components/helpdesk/PriorityBadge";
import { Plus, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const tickets = await prisma.tickets.findMany({
    where: { client_uuid: user.uuid },
    include: {
      statuses: true,
      priorities: true,
      _count: { select: { ticket_comments: true } },
    },
    orderBy: { updated_at: "desc" },
  });

  return (
    <div className="p-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">
            Мои обращения
          </h1>
          <p className="text-(--text-secondary) text-sm mt-1">
            Всего: {tickets.length}
          </p>
        </div>
        <Link
          href="/cabinet/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Новое обращение
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-(--border) rounded-xl">
          <p className="text-(--text-secondary) text-sm">
            У вас пока нет обращений
          </p>
          <Link
            href="/cabinet/tickets/new"
            className="inline-block mt-4 text-(--accent) text-sm hover:underline"
          >
            Создать первое обращение →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link
                href={`/cabinet/tickets/${t.uuid}`}
                className="block p-4 rounded-xl bg-(--bg-card) border border-(--border) hover:border-(--accent) transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-(--text-primary) font-medium truncate">
                      {t.title}
                    </div>
                    {t.description && (
                      <div className="text-sm text-(--text-secondary) line-clamp-2 mt-1">
                        {t.description}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge code={t.statuses?.code} />
                    <PriorityBadge code={t.priorities?.code} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-(--text-muted)">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {t._count.ticket_comments} сообщений
                  </span>
                  <span>
                    Обновлён{" "}
                    {t.updated_at
                      ? new Date(t.updated_at).toLocaleString("ru-RU")
                      : "—"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
