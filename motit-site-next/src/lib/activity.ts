// src/lib/activity.ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@generated/prisma";

export type LogActivityInput = {
  actorUuid?: string | number | null;
  targetType: "site" | "post" | "ticket" | "settings" | "user";
  targetId?: string | number | null;
  action: string;
  ticketUuid?: string | number | null;
  meta?: Prisma.InputJsonValue | null;
};

function normalizeId(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized.length > 0 ? normalized : null;
}

export async function logActivity({
  actorUuid = null,
  targetType,
  targetId = null,
  action,
  ticketUuid = null,
  meta = null,
}: LogActivityInput) {
  return prisma.activity.create({
    data: {
      actor_uuid: normalizeId(actorUuid),
      target_type: targetType,
      target_id: normalizeId(targetId),
      action,
      ticket_uuid: normalizeId(ticketUuid),
      meta,
    },
    select: {
      uuid: true,
      created_at: true,
    },
  });
}