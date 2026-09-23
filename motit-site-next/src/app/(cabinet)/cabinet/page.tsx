// src/app/(cabinet)/cabinet/page.tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Calendar,
  Mail,
  Phone,
  Shield,
  Ticket,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CabinetPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [ticketsCount, commentsCount, organizations] = await Promise.all([
    prisma.tickets.count({ where: { client_uuid: user.uuid } }).catch(() => 0),
    prisma.ticket_comments
      .count({ where: { user_uuid: user.uuid } })
      .catch(() => 0),
    prisma.client_organizations
      .findMany({
        where: { client_user_uuid: user.uuid },
        include: { organizations: true },
        orderBy: [{ is_primary: "desc" }, { joined_at: "desc" }],
      })
      .catch(() => []),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-(--text-primary)">
        Личный кабинет
      </h1>
      <p className="text-(--text-secondary) text-sm mt-1">
        Добро пожаловать, {user.full_name || user.username}
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          title="Роль"
          value={
            user.role === "admin"
              ? "Администратор"
              : user.role === "worker"
                ? "Сотрудник"
                : user.role === "client"
                  ? "Клиент"
                  : user.role === "statistics"
                    ? "Статистика"
                    : "—"
          }
          Icon={Shield}
        />
        <Card
          title="Обращения"
          value={String(ticketsCount)}
          Icon={Ticket}
        />
      </div>

      <div className="mt-8 space-y-3">
        <Row icon={<Mail size={16} />} label="Email" value={user.email} />
        <Row
          icon={<Phone size={16} />}
          label="Телефон"
          value={user.phone || "—"}
        />
        <Row
          icon={<Calendar size={16} />}
          label="Комментариев"
          value={String(commentsCount)}
        />
      </div>

      {/* Организации */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-(--text-muted) uppercase tracking-wider">
            Мои организации
          </h2>
          {organizations.length > 0 && (
            <Link
              href="/cabinet/organizations"
              className="text-xs text-(--accent) hover:opacity-80 transition-opacity"
            >
              Все →
            </Link>
          )}
        </div>

        {organizations.length === 0 ? (
          <p className="text-sm text-(--text-muted)">
            Вы пока не привязаны ни к одной организации.
          </p>
        ) : (
          <div className="space-y-2">
            {organizations.slice(0, 3).map((co) => (
              <div
                key={co.organization_uuid}
                className="flex items-center justify-between p-3 rounded-lg bg-(--bg-card) border border-(--border)"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-(--text-primary) truncate">
                    {co.organizations.name}
                  </div>
                  <div className="text-xs text-(--text-muted) mt-0.5">
                    {co.organizations.inn
                      ? `ИНН: ${co.organizations.inn} · `
                      : ""}
                    роль: {co.role_in_company || "member"}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {co.is_primary && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-(--accent-dim) text-(--accent) border border-(--border)">
                      основная
                    </span>
                  )}
                  {!co.organizations.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                      неактивна
                    </span>
                  )}
                </div>
              </div>
            ))}

            {organizations.length > 3 && (
              <Link
                href="/cabinet/organizations"
                className="block text-center text-xs text-(--text-muted) hover:text-(--accent) transition-colors py-2"
              >
                Ещё {organizations.length - 3}...
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/cabinet/profile"
          className="px-4 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Редактировать профиль
        </Link>
        <Link
          href="/cabinet/tickets"
          className="px-4 py-2 rounded-lg border border-(--border) text-(--accent) text-sm hover:bg-(--accent-dim) transition-colors"
        >
          Мои обращения
        </Link>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  Icon,
}: {
  title: string;
  value: string;
  Icon: typeof Shield;
}) {
  return (
    <div className="p-4 rounded-xl bg-(--bg-card) border border-(--border)">
      <div className="flex items-center gap-2 text-(--text-secondary) text-xs uppercase tracking-wider">
        <Icon size={14} className="text-(--accent)" />
        {title}
      </div>
      <div className="text-xl font-bold text-(--text-primary) mt-2">{value}</div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-(--text-muted)">{icon}</span>
      <span className="text-(--text-muted) w-32">{label}</span>
      <span className="text-(--text-primary)">{value}</span>
    </div>
  );
}
