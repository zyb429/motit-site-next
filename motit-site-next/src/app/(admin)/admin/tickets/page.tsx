// src/app/(admin)/admin/tickets/page.tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listTickets } from "@/lib/db/tickets";
import { StatusBadge } from "@/components/helpdesk/StatusBadge";
import { PriorityBadge } from "@/components/helpdesk/PriorityBadge";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    assigneeId?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total, totalPages } = await listTickets({
    user,
    statusCode: params.status,
    priorityCode: params.priority,
    assigneeId: params.assigneeId ? Number(params.assigneeId) : undefined,
    search: params.search,
    page,
    pageSize: 20,
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-(--text-primary)">
          Обращения
        </h1>
        <p className="text-sm text-(--text-muted) mt-1">Всего: {total}</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-(--border) rounded-xl text-(--text-muted)">
          Обращений пока нет
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t.uuid}>
              <Link
                href={`/admin/tickets/${t.uuid}`}
                className="flex items-center justify-between p-4 rounded-xl bg-(--bg-card) border border-(--border) hover:border-(--accent)/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-(--text-muted) mb-1">
                    {t.ticket_category && (
                      <span>
                        {t.ticket_category.icon} {t.ticket_category.name}
                      </span>
                    )}
                    {t.client?.full_name && (
                      <>
                        <span>·</span>
                        <span>{t.client.full_name}</span>
                      </>
                    )}
                  </div>
                  <div className="text-(--text-primary) font-medium truncate">
                    {t.title}
                  </div>
                  <div className="text-xs text-(--text-muted) mt-1">
                    {t.created_at
                      ? new Date(t.created_at).toLocaleString("ru-RU")
                      : "—"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                  <StatusBadge code={t.statuses?.code} />
                  <PriorityBadge code={t.priorities?.code} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6 text-center text-sm text-(--text-muted)">
          Страница {page} из {totalPages}
        </div>
      )}
    </div>
  );
}
