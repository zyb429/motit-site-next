// src/app/(admin)/admin/tickets/[uuid]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, User2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getTicket } from "@/lib/db/tickets";
import { StatusBadge } from "@/components/helpdesk/StatusBadge";
import { PriorityBadge } from "@/components/helpdesk/PriorityBadge";
import { TicketThread } from "@/components/helpdesk/TicketThread";
import { TicketControls } from "@/components/helpdesk/TicketControls";
import { TicketAttachments } from "@/components/helpdesk/TicketAttachments";
import { listStatuses, listPriorities } from "@/lib/db/tickets";
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

  // Список возможных исполнителей (worker/admin)
  const agents = await prisma.users.findMany({
    where: {
      users_role_lnk: {
        some: {
          roles: { name: { in: ["admin", "worker"] } },
        },
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

  return (
    <div className="p-8 w-full max-w-4xl mx-auto">
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-1 text-sm text-(--text-muted) hover:text-(--accent) transition-colors"
      >
        <ArrowLeft size={14} />
        К списку обращений
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-(--text-primary)">
            {ticket.title}
          </h1>
          <div className="text-xs text-(--text-muted) mt-1">
            {ticket.ticket_category && (
              <>
                {ticket.ticket_category.icon} {ticket.ticket_category.name}
                {" · "}
              </>
            )}
            Создан{" "}
            {ticket.created_at
              ? new Date(ticket.created_at).toLocaleString("ru-RU")
              : "—"}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge code={ticket.statuses?.code} />
          <PriorityBadge code={ticket.priorities?.code} />
        </div>
      </div>

      {/* Контактные данные */}
      <div className="mt-6 p-4 rounded-xl bg-(--bg-card) border border-(--border) text-sm space-y-1">
        {ticket.contact_name && (
          <div className="flex items-center gap-2">
            <User2 size={14} className="text-(--text-muted)" />
            <span className="text-(--text-primary)">{ticket.contact_name}</span>
          </div>
        )}
        {ticket.contact_email && (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-(--text-muted)" />
            <a
              href={`mailto:${ticket.contact_email}`}
              className="text-(--accent) hover:underline"
            >
              {ticket.contact_email}
            </a>
          </div>
        )}
        {ticket.contact_phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-(--text-muted)" />
            <a
              href={`tel:${ticket.contact_phone}`}
              className="text-(--text-primary)"
            >
              {ticket.contact_phone}
            </a>
          </div>
        )}
        {ticket.organization && (
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-(--text-muted)" />
            <span className="text-(--text-primary)">
              {ticket.organization.name}
              {ticket.organization.inn
                ? ` (ИНН ${ticket.organization.inn})`
                : ""}
            </span>
          </div>
        )}
      </div>

      {/* Описание */}
      {ticket.description && (
        <div className="mt-4 p-4 rounded-xl bg-(--bg-card) border border-(--border) text-(--text-secondary) whitespace-pre-wrap">
          {ticket.description}
        </div>
      )}

      {/* Вложения к заявке */}
      <TicketAttachments attachments={ticket.attachments ?? []} />

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

      {/* Переписка с возможностью внутренних заметок */}
      <TicketThread
        ticketUuid={ticket.uuid}
        initialComments={ticket.ticket_comments ?? []}
        canPostInternal={true}
      />
    </div>
  );
}
