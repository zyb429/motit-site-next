// src/app/(admin)/admin/tickets/[uuid]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  User2,
  Calendar,
  Tag,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getTicket,
  listStatuses,
  listPriorities,
  clientOrganization,
} from "@/lib/db/tickets";
import { StatusBadge } from "@/components/helpdesk/StatusBadge";
import { PriorityBadge } from "@/components/helpdesk/PriorityBadge";
import { TicketThread } from "@/components/helpdesk/TicketThread";
import { TicketControls } from "@/components/helpdesk/TicketControls";
import { TicketAttachments } from "@/components/helpdesk/TicketAttachments";
import {
  getLastStatusChange,
  getStatusHistory,
} from "@/lib/db/ticket-status-history";
import { LastStatusChangeBlock } from "@/components/helpdesk/LastStatusChange";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { uuid } = await params;
  const ticket = await getTicket(uuid, user);
  if (!ticket) notFound();

  const agents = await prisma.users.findMany({
    where: {
      users_role_lnk: {
        some: { roles: { name: { in: ["admin", "worker"] } } },
      },
      blocked: false,
    },
    select: { uuid: true, username: true, full_name: true },
    orderBy: { full_name: "asc" },
  });

  const [statuses, priorities] = await Promise.all([
    listStatuses(),
    listPriorities(),
  ]);

  const isSelfCreated = ticket.created_by?.uuid === ticket.client_uuid;
  const creatorLabel = isSelfCreated
    ? "клиент"
    : ticket.created_by
      ? ticket.created_by.full_name || ticket.created_by.username || "—"
      : "—";

  const orgText = clientOrganization(ticket.client, ticket.organization);

  const [lastChange, history] = await Promise.all([
    getLastStatusChange(ticket.uuid),
    getStatusHistory(ticket.uuid),
  ]);

  return (
    <div className="p-8 w-full max-w-4xl mx-auto">
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-1 text-sm text-(--text-muted) hover:text-(--accent) transition-colors"
      >
        <ArrowLeft size={14} />
        К списку обращений
      </Link>

      {/* Шапка тикета */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-(--text-primary)">
            {ticket.title}
          </h1>
          <LastStatusChangeBlock
            change={lastChange}
            history={history}
            className="mt-2"
          />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--text-muted) mt-1.5">
            {ticket.ticket_category && (
              <span className="inline-flex items-center gap-1">
                <Tag size={11} />
                {ticket.ticket_category.icon} {ticket.ticket_category.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />
              {ticket.created_at
                ? new Date(ticket.created_at).toLocaleString("ru-RU")
                : "—"}
            </span>
            <span className="inline-flex items-center gap-1">
              <User2 size={11} />
              {creatorLabel}
              {isSelfCreated ? " (клиент)" : ticket.created_by ? " (сотрудник)" : ""}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge code={ticket.statuses?.code} />
          <PriorityBadge code={ticket.priorities?.code} />
        </div>
      </div>

      {/* Панель управления (статус, приоритет, исполнитель) */}
      <TicketControls
        ticketUuid={ticket.uuid}
        currentStatus={ticket.statuses?.code ?? null}
        currentPriority={ticket.priorities?.code ?? null}
        currentAssigneeUuid={ticket.assignee?.uuid ?? null}
        statuses={statuses.map((s) => ({ code: s.code ?? "", name: s.name }))}
        priorities={priorities.map((p) => ({ code: p.code ?? "", name: p.name }))}
        agents={agents.map((a) => ({
          uuid: a.uuid,
          name: a.full_name || a.username || "—",
        }))}
      />

      {/* Клиент */}
      <div className="mt-6 p-4 rounded-xl bg-(--bg-card) border border-(--border)">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-(--text-muted) mb-3">
          Клиент
        </div>

        <div className="space-y-3 text-sm">
          {(ticket.contact_name || ticket.client) && (
            <div className="flex items-start gap-2">
              <User2 size={14} className="text-(--text-muted) shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-(--text-muted)">
                  Контактное лицо
                </div>
                <div className="text-(--text-primary)">
                  {ticket.contact_name || "—"}
                  {ticket.client?.username && (
                    <span className="text-(--text-muted) font-normal">
                      {" "}(@{ticket.client.username})
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Building2 size={14} className="text-(--text-muted) shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-(--text-muted)">
                Организация
              </div>
              {orgText ? (
                <div className="text-(--text-primary)">{orgText}</div>
              ) : (
                <div className="text-(--text-muted) italic text-xs">
                  не привязана
                </div>
              )}
            </div>
          </div>

          {(ticket.contact_email || ticket.contact_phone) && (
            <>
              <div className="border-t border-(--border) my-1" />
              <div className="space-y-3">
                {ticket.contact_email && (
                  <div className="flex items-start gap-2 mt-3">
                    <Mail size={14} className="text-(--text-muted) shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-(--text-muted)">
                        Email
                      </div>
                      <a
                        href={`mailto:${ticket.contact_email}`}
                        className="text-(--accent) hover:underline truncate block"
                      >
                        {ticket.contact_email}
                      </a>
                    </div>
                  </div>
                )}

                {ticket.contact_phone && (
                  <div className="flex items-start gap-2">
                    <Phone size={14} className="text-(--text-muted) shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-(--text-muted)">
                        Телефон
                      </div>
                      <a
                        href={`tel:${ticket.contact_phone}`}
                        className="text-(--text-primary) block"
                      >
                        {ticket.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Описание */}
      {ticket.description && (
        <div className="mt-6">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-(--text-muted) mb-2">
            Описание
          </div>
          <div className="p-4 rounded-xl bg-(--bg-card) border border-(--border) text-(--text-secondary) whitespace-pre-wrap text-sm">
            {ticket.description}
          </div>
        </div>
      )}

      {/* Вложения к заявке */}
      <TicketAttachments attachments={ticket.attachments ?? []} />

      {/* Переписка с возможностью внутренних заметок */}
      <TicketThread
        ticketUuid={ticket.uuid}
        initialComments={ticket.ticket_comments ?? []}
        canPostInternal={true}
      />
    </div>
  );
}
