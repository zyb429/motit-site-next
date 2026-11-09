// src/lib/db/ticket-status-history.ts
import { prisma } from "@/lib/prisma";

import type {
  StatusHistoryEntry,
  LastStatusChange,
} from "@/lib/tickets/status-history-types";

// Реэкспорт типов и утилит для обратной совместимости
export type { StatusHistoryEntry, LastStatusChange };
export { timeAgo, shortUser } from "@/lib/tickets/status-history-types";

// --------------------------------------------
// Последняя смена статуса
// --------------------------------------------
export async function getLastStatusChange(
  ticketUuid: string,
): Promise<LastStatusChange | null> {
  const row = await prisma.ticket_status_history.findFirst({
    where: { ticket_uuid: ticketUuid },
    orderBy: { created_at: "desc" },
    select: {
      created_at: true,
      changed_by: { select: { uuid: true, username: true, full_name: true } },
      statuses: { select: { code: true, name: true, is_final: true } },
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
      statuses: { select: { code: true, name: true, is_final: true } },
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

// --------------------------------------------
// Полная история статусов
// --------------------------------------------
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
      statuses: { select: { code: true, name: true, is_final: true } },
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
      statuses: { select: { code: true, name: true, is_final: true } },
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

// --------------------------------------------
// Версия для клиентов: без автора смены
// --------------------------------------------
export async function getStatusHistoryForClient(
  ticketUuid: string,
): Promise<StatusHistoryEntry[]> {
  const rows = await prisma.ticket_status_history.findMany({
    where: { ticket_uuid: ticketUuid },
    orderBy: { created_at: "desc" },
    select: {
      created_at: true,
      comment: true,
      statuses: { select: { code: true, name: true, is_final: true } },
      old_status: { select: { code: true, name: true } },
    },
  });

  return rows.map((row) => ({
    changed_at: row.created_at ?? null,
    changed_by: null,
    status: row.statuses ?? null,
    old_status: row.old_status ?? null,
    comment: row.comment ?? null,
  }));
}

export async function getStatusHistoryBatchForClient(
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
      statuses: { select: { code: true, name: true, is_final: true } },
      old_status: { select: { code: true, name: true } },
    },
  });

  for (const row of rows) {
    if (!row.ticket_uuid) continue;
    const list = map.get(row.ticket_uuid) ?? [];
    list.push({
      changed_at: row.created_at ?? null,
      changed_by: null,
      status: row.statuses ?? null,
      old_status: row.old_status ?? null,
      comment: row.comment ?? null,
    });
    map.set(row.ticket_uuid, list);
  }
  return map;
}

export async function getLastStatusChangeForClient(
  ticketUuid: string,
): Promise<LastStatusChange | null> {
  const history = await getStatusHistoryForClient(ticketUuid);
  return history[0] ?? null;
}

export async function getLastStatusChangesBatchForClient(
  ticketUuids: string[],
): Promise<Map<string, LastStatusChange>> {
  const map = new Map<string, LastStatusChange>();
  const histories = await getStatusHistoryBatchForClient(ticketUuids);
  for (const [uuid, list] of histories) {
    if (list[0]) map.set(uuid, list[0]);
  }
  return map;
}