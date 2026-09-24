// src/app/(cabinet)/cabinet/tickets/[uuid]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getTicket } from "@/lib/db/tickets";
import { StatusBadge } from "@/components/helpdesk/StatusBadge";
import { PriorityBadge } from "@/components/helpdesk/PriorityBadge";
import { TicketThread } from "@/components/helpdesk/TicketThread";
import {
  getLastStatusChangeForClient,
  getStatusHistoryForClient,
} from "@/lib/db/ticket-status-history";
import { LastStatusChangeBlock } from "@/components/helpdesk/LastStatusChange";

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { uuid } = await params;
  const ticket = await getTicket(uuid, user);
  if (!ticket) notFound();

  const [lastChange, history] = await Promise.all([
    getLastStatusChangeForClient(ticket.uuid),
    getStatusHistoryForClient(ticket.uuid),
  ]);

  return (
    <div className="p-8 w-full max-w-3xl mx-auto">
      <Link
        href="/cabinet/tickets"
        className="inline-flex items-center gap-1 text-sm text-(--text-secondary) hover:text-(--accent) transition-colors"
      >
        <ArrowLeft size={14} />
        К списку обращений
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-(--text-primary)">
            {ticket.title}
          </h1>
          <LastStatusChangeBlock
            change={lastChange}
            history={history}
            className="mt-1"
          />
          <div className="text-xs text-(--text-muted) mt-1">
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

      {ticket.description && (
        <div className="mt-6 p-4 rounded-xl bg-(--bg-card) border border-(--border) text-(--text-secondary) whitespace-pre-wrap">
          {ticket.description}
        </div>
      )}

      {/* Метаданные контакта */}
      {(ticket.contact_name ||
        ticket.contact_email ||
        ticket.contact_phone ||
        ticket.organization) && (
        <div className="mt-4 p-4 rounded-xl bg-(--bg-card) border border-(--border) text-sm space-y-1">
          {ticket.contact_name && (
            <div>
              <span className="text-(--text-muted)">Контакт: </span>
              <span className="text-(--text-primary)">
                {ticket.contact_name}
              </span>
            </div>
          )}
          {ticket.contact_email && (
            <div>
              <span className="text-(--text-muted)">Email: </span>
              <span className="text-(--text-primary)">
                {ticket.contact_email}
              </span>
            </div>
          )}
          {ticket.contact_phone && (
            <div>
              <span className="text-(--text-muted)">Телефон: </span>
              <span className="text-(--text-primary)">
                {ticket.contact_phone}
              </span>
            </div>
          )}
          {ticket.organization && (
            <div>
              <span className="text-(--text-muted)">Предприятие: </span>
              <span className="text-(--text-primary)">
                {ticket.organization.name}
                {ticket.organization.inn
                  ? ` (ИНН ${ticket.organization.inn})`
                  : ""}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Вложения */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-(--text-secondary) uppercase tracking-wider mb-3 flex items-center gap-2">
            <Paperclip size={14} />
            Вложения ({ticket.attachments.length})
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ticket.attachments.map((a) => {
              const f = a.files;
              if (!f) return null;
              const isImage = f.mime?.startsWith("image/");
              return (
                <li key={a.uuid}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-3 rounded-xl bg-(--bg-card) border border-(--border) hover:border-(--accent) transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={f.url}
                          alt={f.name ?? "Вложение"}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-(--bg-primary) flex items-center justify-center text-(--accent) shrink-0">
                          <Paperclip size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm text-(--text-primary) truncate group-hover:text-(--accent) transition-colors">
                          {f.name ?? "Файл"}
                        </div>
                        <div className="text-xs text-(--text-muted)">
                          {f.size
                            ? `${(Number(f.size) / 1024).toFixed(1)} КБ`
                            : ""}
                          {f.mime ? ` · ${f.mime}` : ""}
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <TicketThread
        ticketUuid={ticket.uuid}
        initialComments={ticket.ticket_comments ?? []}
        canPostInternal={false}
      />
    </div>
  );
}
