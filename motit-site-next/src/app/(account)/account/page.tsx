// src/app/(account)/account/page.tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, Mail, Phone, Shield, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [ticketsCount, commentsCount] = await Promise.all([
    prisma.tickets.count({ where: { client_uuid: user.uuid } }).catch(() => 0),
    prisma.ticket_comments
      .count({ where: { user_uuid: user.uuid } })
      .catch(() => 0),
  ]);

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#e0f7fa]">
        Личный кабинет
      </h1>
      <p className="text-gray-400 text-sm mt-1">
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

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/account/profile"
          className="px-4 py-2 rounded-lg bg-[#2dd4bf] text-[#0a1920] text-sm font-medium hover:bg-[#14b8a6] transition-colors"
        >
          Редактировать профиль
        </Link>
        <Link
          href="/account/tickets"
          className="px-4 py-2 rounded-lg border border-[rgba(45,212,191,0.15)] text-[#2dd4bf] text-sm hover:bg-[#2dd4bf]/5 transition-colors"
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
    <div className="p-4 rounded-xl bg-[#0f2832] border border-[rgba(45,212,191,0.06)]">
      <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider">
        <Icon size={14} className="text-[#2dd4bf]" />
        {title}
      </div>
      <div className="text-xl font-bold text-[#e0f7fa] mt-2">{value}</div>
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
      <span className="text-gray-500">{icon}</span>
      <span className="text-gray-500 w-32">{label}</span>
      <span className="text-[#e0f7fa]">{value}</span>
    </div>
  );
}
