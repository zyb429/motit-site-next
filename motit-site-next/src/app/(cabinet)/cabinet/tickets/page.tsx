// src/app/(cabinet)/cabinet/tickets/page.tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/helpdesk/StatusBadge";
import { PriorityBadge } from "@/components/helpdesk/PriorityBadge";
import {
  getLastStatusChangesBatchForClient,
  getStatusHistoryBatchForClient,
} from "@/lib/db/ticket-status-history";
import { LastStatusChangeBlock } from "@/components/helpdesk/LastStatusChange";
import { Plus, MessageSquare, User2 } from "lucide-react";

export const dynamic = "force-dynamic";

type CreatorInfo = {
  id: number;
  uuid: string;
  username: string | null;
  full_name: string | null;
};

async function attachCreators<
  T extends { created_by_id: number | null }
>(tickets: T[]): Promise<(T & { created_by: CreatorInfo | null })[]> {
  const ids = [
    ...new Set(tickets.map((t) => t.created_by_id).filter(Boolean)),
  ] as number[];

  if (ids.length === 0) {
    return tickets.map((t) => ({ ...t, created_by: null }));
  }

  const creators = await prisma.users.findMany({
    where: { id: { in: ids } },
    select: { id: true, uuid: true, username: true, full_name: true },
  });

  const byId = new Map(creators.map((u) => [u.id, u]));

  return tickets.map((t) => ({
    ...t,
    created_by: t.created_by_id ? byId.get(t.created_by_id) ?? null : null,
  }));
}

export default async function TicketsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const ticketsRaw = await prisma.tickets.findMany({
    where: { client_uuid: user.uuid },
    include: {
      statuses: true,
      priorities: true,
      client: { select: { uuid: true, full_name: true, username: true } },
      _count: { select: { ticket_comments: true } },
    },
    orderBy: { updated_at: "desc" },
  });

  const tickets = await attachCreators(ticketsRaw);

  const [lastChanges, histories] = await Promise.all([
    getLastStatusChangesBatchForClient(tickets.map((t) => t.uuid)),
    getStatusHistoryBatchForClient(tickets.map((t) => t.uuid)),
  ]);

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
          {tickets.map((t) => {
            const isSelfCreated = t.created_by?.uuid === t.client_uuid;
            const creatorLabel = isSelfCreated
              ? "клиент"
              : t.created_by
                ? `${t.created_by.full_name || t.created_by.username} (сотрудник)`
                : "—";

            return (
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
                    <span className="flex items-center gap-1">
                      <User2 size={12} />
                      Создал: {creatorLabel}
                    </span>
                    <span>
                      Обновлён{" "}
                      {t.updated_at
                        ? new Date(t.updated_at).toLocaleString("ru-RU")
                        : "—"}
                    </span>
                  </div>
                  <LastStatusChangeBlock
                    change={lastChanges.get(t.uuid) ?? null}
                    history={histories.get(t.uuid)}
                    className="mt-2"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
