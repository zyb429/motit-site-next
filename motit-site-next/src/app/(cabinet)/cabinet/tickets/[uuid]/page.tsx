// src/app/(cabinet)/cabinet/tickets/[uuid]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  User,
  Mail,
  Phone,
  Building2,
  Clock,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getTicket } from "@/lib/db/tickets";
import { StatusBadge } from "@/components/helpdesk/StatusBadge";
import { PriorityBadge } from "@/components/helpdesk/PriorityBadge";
import { TicketThread } from "@/components/helpdesk/TicketThread";
import { TicketReplyForm } from "@/components/helpdesk/TicketReplyForm";
import { TicketAttachments } from "@/components/helpdesk/TicketAttachments";
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

  const hasContacts =
    ticket.contact_name ||
    ticket.contact_email ||
    ticket.contact_phone ||
    ticket.organization;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-(--bg-primary)">
      {/* Скролл-контейнер с контентом */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/cabinet/tickets"
              className="inline-flex items-center gap-1.5 text-sm text-(--text-muted) hover:text-(--accent) transition-colors mb-5"
            >
              <ArrowLeft size={16} />
              К списку обращений
            </Link>

            {/* Заголовок */}
            <header className="mb-6">
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                <StatusBadge code={ticket.statuses?.code} />
                <PriorityBadge code={ticket.priorities?.code} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-(--text-primary) tracking-tight leading-tight">
                    {ticket.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-(--text-muted)">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={12} />
                      Создан{" "}
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>

                  <LastStatusChangeBlock
                    change={lastChange}
                    history={history}
                    className="mt-2.5"
                  />
                </div>

                {ticket.chat && (
                  <Link
                    href={`/cabinet/chat/${ticket.chat.uuid}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-(--border) hover:border-(--accent)/40 hover:bg-(--accent-dim) text-(--text-secondary) hover:text-(--accent) text-sm font-medium transition-all shrink-0 w-full sm:w-auto"
                  >
                    <MessageSquare size={16} />
                    Перейти в чат
                  </Link>
                )}
              </div>
            </header>

            {/* Описание */}
            {ticket.description && (
              <section className="p-5 sm:p-6 rounded-2xl bg-(--bg-card) border border-(--border)">
                <div className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3">
                  Описание
                </div>
                <div className="text-sm sm:text-base text-(--text-secondary) whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </div>
              </section>
            )}

            {/* Контакты */}
            {hasContacts && (
              <section className="mt-4 p-5 sm:p-6 rounded-2xl bg-(--bg-card) border border-(--border)">
                <div className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-4">
                  Контактная информация
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {ticket.contact_name && (
                    <InfoRow
                      icon={<User size={16} />}
                      label="Контакт"
                      value={ticket.contact_name}
                    />
                  )}
                  {ticket.contact_email && (
                    <InfoRow
                      icon={<Mail size={16} />}
                      label="Email"
                      value={ticket.contact_email}
                    />
                  )}
                  {ticket.contact_phone && (
                    <InfoRow
                      icon={<Phone size={16} />}
                      label="Телефон"
                      value={ticket.contact_phone}
                    />
                  )}
                  {ticket.organization && (
                    <InfoRow
                      icon={<Building2 size={16} />}
                      label="Предприятие"
                      value={`${ticket.organization.name}${
                        ticket.organization.inn
                          ? ` (ИНН ${ticket.organization.inn})`
                          : ""
                      }`}
                    />
                  )}
                </div>
              </section>
            )}

            {/* Вложения */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <TicketAttachments attachments={ticket.attachments} />
            )}

            {/* Лента комментариев (только лента, без формы) */}
            <div className="mt-8">
              <TicketThread
                comments={ticket.ticket_comments ?? []}
                title="Переписка"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Форма ответа — вне скролл-контейнера, sticky к низу viewport */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-t border-(--border) bg-(--bg-card)/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <TicketReplyForm
            ticketUuid={ticket.uuid}
            canPostInternal={false}
            canPostExternal={true}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-(--bg-secondary) flex items-center justify-center text-(--text-muted) shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-(--text-muted) mb-0.5">{label}</div>
        <div className="text-sm font-medium text-(--text-primary) truncate">
          {value}
        </div>
      </div>
    </div>
  );
}