// src/lib/db/ticket-status-history.ts
import { prisma } from "@/lib/prisma";

export type LastStatusChange = {
  changed_at: Date | null;
  changed_by: {
    uuid: string;
    username: string | null;
    full_name: string | null;
  } | null;
  status: { code: string | null; name: string | null; is_final: boolean | null } | null;
  old_status: { code: string | null; name: string | null } | null;
};

export async function getLastStatusChange(
  ticketUuid: string,
): Promise<LastStatusChange | null> {
  const row = await prisma.ticket_status_history.findFirst({
    where: { ticket_uuid: ticketUuid },
    orderBy: { created_at: "desc" },
    select: {
      created_at: true,
      changed_by: { select: { uuid: true, username: true, full_name: true } },
      statuses:   { select: { code: true, name: true, is_final: true } },
      old_status: { select: { code: true, name: true } },
    },
  });
  if (!row) return null;
  return {
    changed_at: row.created_at ?? null,
    changed_by: row.changed_by ?? null,
    status: row.statuses ?? null,
    old_status: row.old_status ?? null,
  };
}

export async function getLastStatusChangesBatch(
  ticketUuids: string[],
): Promise<Map<string, LastStatusChange>> {
  const map = new Map<string, LastStatusChange>();
  if (ticketUuids.length === 0) return map;

  const rows = await prisma.ticket_status_history.findMany({
    where: { ticket_uuid: { in: ticketUuids } },
    orderBy: { created_at: "desc" },
    select: {
      ticket_uuid: true,
      created_at: true,
      changed_by: { select: { uuid: true, username: true, full_name: true } },
      statuses:   { select: { code: true, name: true, is_final: true } },
      old_status: { select: { code: true, name: true } },
    },
  });

  for (const row of rows) {
    if (!row.ticket_uuid || map.has(row.ticket_uuid)) continue;
    map.set(row.ticket_uuid, {
      changed_at: row.created_at ?? null,
      changed_by: row.changed_by ?? null,
      status: row.statuses ?? null,
      old_status: row.old_status ?? null,
    });
  }
  return map;
}

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

// --------------------------------------------
// Полная история статусов
// --------------------------------------------
export type StatusHistoryEntry = {
  changed_at: Date | null;
  changed_by: {
    uuid: string;
    username: string | null;
    full_name: string | null;
  } | null;
  status: { code: string | null; name: string | null; is_final: boolean | null } | null;
  old_status: { code: string | null; name: string | null } | null;
  comment: string | null;
};

/** Полная история смен статуса по одному тикету (от новых к старым). */
export async function getStatusHistory(
  ticketUuid: string,
): Promise<StatusHistoryEntry[]> {
  const rows = await prisma.ticket_status_history.findMany({
    where: { ticket_uuid: ticketUuid },
    orderBy: { created_at: "desc" },
    select: {
      created_at: true,
      comment: true,
      changed_by: { select: { uuid: true, username: true, full_name: true } },
      statuses:   { select: { code: true, name: true, is_final: true } },
      old_status: { select: { code: true, name: true } },
    },
  });

  return rows.map((row) => ({
    changed_at: row.created_at ?? null,
    changed_by: row.changed_by ?? null,
    status: row.statuses ?? null,
    old_status: row.old_status ?? null,
    comment: row.comment ?? null,
  }));
}

/** Батч: полная история для набора тикетов. */
export async function getStatusHistoryBatch(
  ticketUuids: string[],
): Promise<Map<string, StatusHistoryEntry[]>> {
  const map = new Map<string, StatusHistoryEntry[]>();
  if (ticketUuids.length === 0) return map;

  const rows = await prisma.ticket_status_history.findMany({
    where: { ticket_uuid: { in: ticketUuids } },
    orderBy: { created_at: "desc" },
    select: {
      ticket_uuid: true,
      created_at: true,
      comment: true,
      changed_by: { select: { uuid: true, username: true, full_name: true } },
      statuses:   { select: { code: true, name: true, is_final: true } },
      old_status: { select: { code: true, name: true } },
    },
  });

  for (const row of rows) {
    if (!row.ticket_uuid) continue;
    const list = map.get(row.ticket_uuid) ?? [];
    list.push({
      changed_at: row.created_at ?? null,
      changed_by: row.changed_by ?? null,
      status: row.statuses ?? null,
      old_status: row.old_status ?? null,
      comment: row.comment ?? null,
    });
    map.set(row.ticket_uuid, list);
  }
  return map;
}
