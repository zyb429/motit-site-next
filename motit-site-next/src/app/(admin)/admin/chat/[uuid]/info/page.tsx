// src/app/(admin)/admin/chat/[uuid]/info/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Hash,
  Lock,
  Bookmark,
  User as UserIcon,
  Calendar,
  Shield,
  Crown,
  Bell,
  Pin,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getChatByUuid } from "@/lib/db/chat";

export const dynamic = "force-dynamic";

export default async function AdminChatInfoPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { uuid } = await params;

  const chat = await getChatByUuid(uuid, user.uuid);
  if (!chat) notFound();

  const isSavedChat = chat.kind === "saved";
  const isDirect = chat.kind === "direct";

  const KindIcon = isSavedChat
    ? Bookmark
    : chat.kind === "private_channel"
      ? Lock
      : chat.kind === "channel"
        ? Hash
        : chat.kind === "group"
          ? Users
          : UserIcon;

  const kindLabel = isSavedChat
    ? "Избранное"
    : chat.kind === "private_channel"
      ? "Приватный канал"
      : chat.kind === "channel"
        ? "Канал"
        : chat.kind === "group"
          ? "Групповой чат"
          : "Личный чат";

  const otherMember = isDirect
    ? chat.members.find((m) => m.user.uuid !== user.uuid)
    : null;

  const displayName = isDirect
    ? otherMember?.user.full_name ??
      otherMember?.user.username ??
      "Без имени"
    : chat.name ?? "Без названия";

  return (
    <div className="p-8 w-full max-w-2xl mx-auto flex-1 min-h-0 overflow-y-auto">
      <Link
        href={`/admin/chat/${chat.uuid}`}
        className="inline-flex items-center gap-1 text-sm text-(--text-muted) hover:text-(--accent) transition-colors"
      >
        <ArrowLeft size={14} />
        К чату
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-(--bg-card) border border-(--border) flex items-center justify-center shrink-0 overflow-hidden">
          {otherMember?.user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={otherMember.user.avatar_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <KindIcon size={26} className="text-(--text-muted)" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-(--text-primary) truncate">
            {displayName}
          </h1>
          <p className="text-sm text-(--text-muted) mt-0.5">{kindLabel}</p>
        </div>
      </div>

      {/* Метаданные */}
      <div className="mt-6 p-4 rounded-xl bg-(--bg-card) border border-(--border) space-y-3 text-sm">
        <Row icon={<KindIcon size={14} />} label="Тип" value={kindLabel} />
        <Row
          icon={<Users size={14} />}
          label="Участников"
          value={String(chat.members.length)}
        />
        {!isDirect && !isSavedChat && (
          <Row
            icon={<Calendar size={14} />}
            label="Создан"
            value={
              chat.created_at
                ? new Date(chat.created_at).toLocaleString("ru-RU")
                : "—"
            }
          />
        )}
        {chat.created_by && (
          <Row
            icon={<UserIcon size={14} />}
            label="Создал"
            value={chat.created_by.full_name ?? chat.created_by.username ?? "—"}
          />
        )}
      </div>

      {/* Ваш статус */}
      {!isSavedChat && (
        <div className="mt-6 p-4 rounded-xl bg-(--bg-card) border border-(--border) space-y-3 text-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
            Ваш статус
          </div>
          <Row
            icon={<Shield size={14} />}
            label="Роль"
            value={
              chat.role === "owner"
                ? "Владелец"
                : chat.role === "admin"
                  ? "Администратор"
                  : "Участник"
            }
          />
          <Row
            icon={<Bell size={14} />}
            label="Уведомления"
            value={chat.is_muted ? "отключены" : "включены"}
          />
          <Row
            icon={<Pin size={14} />}
            label="Закреплён"
            value={chat.is_pinned ? "да" : "нет"}
          />
        </div>
      )}

      {/* Участники */}
      {!isSavedChat && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-(--text-muted) uppercase tracking-wider mb-3">
            Участники · {chat.members.length}
          </h2>

          <ul className="space-y-2">
            {chat.members.map((m) => {
              const isOwner = m.role === "owner";
              const isAdmin = m.role === "admin";

              return (
                <li
                  key={m.uuid}
                  className="flex items-center gap-3 p-3 rounded-lg bg-(--bg-card) border border-(--border)"
                >
                  <div className="w-9 h-9 rounded-full bg-(--bg-primary) border border-(--border) flex items-center justify-center shrink-0 overflow-hidden">
                    {m.user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.user.avatar_url}
                        alt={m.user.full_name ?? "—"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={16} className="text-(--text-muted)" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-(--text-primary) truncate">
                      {m.user.full_name ?? m.user.username ?? "—"}
                      {m.user.uuid === user.uuid && (
                        <span className="text-(--text-muted) font-normal">
                          {" "}
                          (вы)
                        </span>
                      )}
                    </div>
                    {m.user.username && (
                      <div className="text-xs text-(--text-muted) truncate">
                        @{m.user.username}
                      </div>
                    )}
                  </div>

                  {(isOwner || isAdmin) && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-(--accent-dim) text-(--accent) border border-(--border)">
                      {isOwner ? <Crown size={10} /> : <Shield size={10} />}
                      {isOwner ? "владелец" : "админ"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Быстрые действия */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/admin/chat/${chat.uuid}/settings`}
          className="px-4 py-2 rounded-lg border border-(--border) text-(--text-secondary) hover:text-(--accent) hover:border-(--accent) text-sm transition-colors"
        >
          Настройки чата
        </Link>
        <Link
          href={`/admin/chat/${chat.uuid}`}
          className="px-4 py-2 rounded-lg border border-(--border) text-(--text-secondary) hover:text-(--accent) hover:border-(--accent) text-sm transition-colors"
        >
          Вернуться в чат
        </Link>
      </div>
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
    <div className="flex items-center gap-3">
      <span className="text-(--text-muted) shrink-0">{icon}</span>
      <span className="text-(--text-muted) w-32 shrink-0">{label}</span>
      <span className="text-(--text-primary) truncate">{value}</span>
    </div>
  );
}
