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
import { Plus, MessageSquare, Clock, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type CreatorInfo = {
  id: number;
  uuid: string;
  username: string | null;
  full_name: string | null;
};

async function attachCreators<T extends { created_by_id: number | null }>(
  tickets: T[],
): Promise<(T & { created_by: CreatorInfo | null })[]> {
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
    <div className="flex-1 min-h-0 overflow-y-auto bg-(--bg-primary)">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary) tracking-tight">
                Мои обращения
              </h1>
              <p className="text-sm text-(--text-muted) mt-1.5">
                {tickets.length === 0
                  ? "У вас пока нет обращений"
                  : `${tickets.length} ${tickets.length === 1 ? "обращение" : tickets.length < 5 ? "обращения" : "обращений"}`}
              </p>
            </div>
            <Link
              href="/cabinet/tickets/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-(--accent) text-(--bg-primary) text-sm font-semibold hover:bg-(--accent-hover) active:scale-[0.98] transition-all shadow-sm shadow-(--accent-dim) w-full sm:w-auto"
            >
              <Plus size={16} />
              Новое обращение
            </Link>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-16 sm:py-24 border-2 border-dashed border-(--border) rounded-3xl bg-(--bg-card)/50">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-(--bg-secondary) flex items-center justify-center">
                <MessageSquare size={28} className="text-(--text-muted) opacity-50" />
              </div>
              <p className="text-base font-semibold text-(--text-primary) mb-1.5">
                Пока нет обращений
              </p>
              <p className="text-sm text-(--text-muted) mb-5 max-w-xs mx-auto">
                Создайте первое обращение — мы ответим как можно скорее
              </p>
              <Link
                href="/cabinet/tickets/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--accent) text-(--bg-primary) text-sm font-semibold hover:bg-(--accent-hover) transition-all"
              >
                <Plus size={16} />
                Создать обращение
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {tickets.map((t) => {
                const isSelfCreated = t.created_by?.uuid === t.client_uuid;
                const creatorLabel = isSelfCreated
                  ? "Вы"
                  : t.created_by?.full_name || t.created_by?.username || "—";

                return (
                  <li key={t.uuid}>
                    <div className="group relative rounded-2xl bg-(--bg-card) border border-(--border) hover:border-(--accent)/40 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 transition-all duration-200 overflow-hidden">
                      {/* Левая цветная полоска статуса */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                        style={{
                          backgroundColor:
                            t.statuses?.color ?? "var(--border)",
                        }}
                      />

                      <div className="pl-5 pr-4 sm:pr-5 py-4 sm:py-5">
                        {/* Верхняя строка: бейджи + дата */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <StatusBadge code={t.statuses?.code} />
                            <PriorityBadge code={t.priorities?.code} />
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-xs text-(--text-muted) shrink-0">
                            <Clock size={12} />
                            {t.updated_at
                              ? new Date(t.updated_at).toLocaleDateString("ru-RU", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "—"}
                          </span>
                        </div>

                        {/* Кликабельная зона: заголовок + описание */}
                        <Link href={`/cabinet/tickets/${t.uuid}`} className="block">
                          <h3 className="text-base sm:text-lg font-semibold text-(--text-primary) group-hover:text-(--accent) transition-colors line-clamp-2 leading-snug">
                            {t.title}
                          </h3>
                          {t.description && (
                            <p className="text-sm text-(--text-secondary) line-clamp-2 mt-1.5 leading-relaxed">
                              {t.description}
                            </p>
                          )}
                        </Link>

                        {/* Метаданные + «Перейти» */}
                        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-(--border)">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-(--text-muted) min-w-0">
                            <span className="inline-flex items-center gap-1.5">
                              <MessageSquare size={12} />
                              {t._count.ticket_comments}
                            </span>
                            <span className="inline-flex items-center gap-1.5 truncate">
                              {creatorLabel}
                            </span>
                          </div>
                          <Link
                            href={`/cabinet/tickets/${t.uuid}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-(--accent) hover:text-(--accent-hover) shrink-0 transition-colors"
                          >
                            Перейти
                            <ArrowRight size={12} />
                          </Link>
                        </div>

                        {/* История статуса */}
                        <div className="mt-2">
                          <LastStatusChangeBlock
                            change={lastChanges.get(t.uuid) ?? null}
                            history={histories.get(t.uuid)}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}