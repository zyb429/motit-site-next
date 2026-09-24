// src/app/(admin)/admin/tickets/page.tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  listTickets,
  listStatuses,
  listPriorities,
  clientLabel,
  clientOrganization,
} from "@/lib/db/tickets";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/helpdesk/StatusBadge";
import { PriorityBadge } from "@/components/helpdesk/PriorityBadge";
import { TicketFilters } from "@/components/helpdesk/TicketFilters";
import { TicketPagination } from "@/components/helpdesk/TicketPagination";
import {
  getLastStatusChangesBatch,
  getStatusHistoryBatch,
} from "@/lib/db/ticket-status-history";
import { LastStatusChangeBlock } from "@/components/helpdesk/LastStatusChange";
import { User2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const [statuses, priorities, categories, agents, result] = await Promise.all([
    listStatuses(),
    listPriorities(),
    prisma.ticket_categories.findMany({
      where: { is_active: true },
      select: { uuid: true, name: true, icon: true },
      orderBy: { sort_order: "asc" },
    }),
    prisma.users.findMany({
      where: {
        users_role_lnk: {
          some: { roles: { name: { in: ["admin", "worker"] } } },
        },
        blocked: false,
      },
      select: { id: true, username: true, full_name: true },
      orderBy: { full_name: "asc" },
    }),
    listTickets({
      user,
      statusCode: params.status,
      priorityCode: params.priority,
      categoryUuid: params.category,
      assigneeId:
        params.assigneeId === "me" || params.assigneeId === "unassigned"
          ? params.assigneeId
          : params.assigneeId
            ? Number(params.assigneeId)
            : undefined,
      search: params.search,
      sort: params.sort as
        | "created"
        | "updated"
        | "priority"
        | "deadline"
        | undefined,
      dir: params.dir as "asc" | "desc" | undefined,
      page,
      pageSize: 20,
    }),
  ]);

  const { items, total, totalPages, statusCounts } = result;
  const [lastChanges, histories] = await Promise.all([
    getLastStatusChangesBatch(items.map((t) => t.uuid)),
    getStatusHistoryBatch(items.map((t) => t.uuid)),
  ]);

  return (
    <div className="p-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-(--text-primary)">Обращения</h1>
        <p className="text-sm text-(--text-muted) mt-1">Всего: {total}</p>
      </div>

      {/* Счётчики по статусам */}
      {statuses.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {statuses.map((s) => {
            const count = s.code ? statusCounts[s.code] ?? 0 : 0;
            const active = params.status === s.code;
            return (
              <Link
                key={s.uuid}
                href={
                  active ? "/admin/tickets" : `/admin/tickets?status=${s.code}`
                }
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  active
                    ? "bg-(--accent-dim) border-(--accent) text-(--accent)"
                    : "border-(--border) text-(--text-secondary) hover:text-(--accent) hover:border-(--accent)"
                }`}
              >
                {s.name}
                <span className="ml-1.5 text-xs text-(--text-muted)">{count}</span>
              </Link>
            );
          })}
        </div>
      )}

      <TicketFilters
        basePath="/admin/tickets"
        statuses={statuses.map((s) => ({ value: s.code ?? "", label: s.name }))}
        priorities={priorities.map((p) => ({ value: p.code ?? "", label: p.name }))}
        categories={categories.map((c) => ({
          value: c.uuid,
          label: `${c.icon ?? ""} ${c.name}`.trim(),
        }))}
        agents={agents.map((a) => ({
          value: String(a.id),
          label: a.full_name || a.username || "—",
        }))}
      />

      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-(--border) rounded-xl text-(--text-muted)">
          Обращений не найдено
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => {
            const isSelfCreated = t.created_by?.uuid === t.client_uuid;
            const creatorLabel = isSelfCreated
              ? "клиент"
              : t.created_by
                ? `${t.created_by.full_name || t.created_by.username} (сотрудник)`
                : "—";

            const isOverdue =
              t.deadline_at &&
              new Date(t.deadline_at) < new Date() &&
              !t.statuses?.is_final;

            const clientText = clientLabel(t.client);
            const orgText = clientOrganization(t.client, t.organization);

            return (
              <li key={t.uuid}>
                <Link
                  href={`/admin/tickets/${t.uuid}`}
                  className={`flex items-center justify-between p-4 rounded-xl bg-(--bg-card) border transition-colors ${
                    isOverdue
                      ? "border-red-500/40 hover:border-red-500"
                      : "border-(--border) hover:border-(--accent)/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-(--text-muted) mb-1">
                      {t.ticket_category && (
                        <span>
                          {t.ticket_category.icon} {t.ticket_category.name}
                        </span>
                      )}
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 text-red-400">
                          <AlertCircle size={11} />
                          просрочен
                        </span>
                      )}
                    </div>
                    <div className="text-(--text-primary) font-medium truncate">
                      {t.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--text-muted) mt-1">
                      <span>
                        {t.created_at
                          ? new Date(t.created_at).toLocaleString("ru-RU")
                          : "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <User2 size={12} />
                        Создал: {creatorLabel}
                      </span>
                      {t.assignee && (
                        <span>
                          Исполнитель:{" "}
                          {t.assignee.full_name || t.assignee.username}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--text-muted) mt-1">
                      <span>
                        Клиент:{" "}
                        <span className="text-(--text-primary)">
                          {clientText}
                        </span>
                      </span>
                      {orgText ? (
                        <span>
                          Организация:{" "}
                          <span className="text-(--text-primary)">
                            {orgText}
                          </span>
                        </span>
                      ) : (
                        <span className="italic">Организация не привязана</span>
                      )}
                    </div>
                    <LastStatusChangeBlock
                      change={lastChanges.get(t.uuid) ?? null}
                      history={histories.get(t.uuid)}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                    <StatusBadge code={t.statuses?.code} />
                    <PriorityBadge code={t.priorities?.code} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <TicketPagination page={page} totalPages={totalPages} />
    </div>
  );
}
