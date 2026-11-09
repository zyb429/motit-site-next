// src/lib/tickets/status-history-types.ts
// Файл без серверных импортов — безопасен для клиентских компонентов.

export type StatusHistoryEntry = {
  changed_at: Date | string | null;
  changed_by: {
    uuid: string;
    username: string | null;
    full_name: string | null;
  } | null;
  status: {
    code: string | null;
    name: string | null;
    is_final: boolean | null;
  } | null;
  old_status: { code: string | null; name: string | null } | null;
  comment: string | null;
};

export type LastStatusChange = {
  changed_at: Date | string | null;
  changed_by: {
    uuid: string;
    username: string | null;
    full_name: string | null;
  } | null;
  status: {
    code: string | null;
    name: string | null;
    is_final: boolean | null;
  } | null;
  old_status: { code: string | null; name: string | null } | null;
};

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "только что";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} мин назад`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ч назад`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days} дн назад`;
  return d.toLocaleDateString("ru-RU");
}

export function shortUser(
  u: { full_name?: string | null; username?: string | null } | null | undefined,
): string {
  if (!u) return "—";
  return u.full_name?.trim() || u.username?.trim() || "—";
}