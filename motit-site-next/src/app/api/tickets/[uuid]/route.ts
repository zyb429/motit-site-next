// src/app/api/tickets/[uuid]/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  getTicket,
  changeStatus,
  assignTicket,
  changePriority,
} from "@/lib/db/tickets";
import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  statusCode: z
    .enum(["OPEN", "IN_PROGRESS", "WAITING_CLIENT", "RESOLVED", "CLOSED"])
    .optional(),
  priorityCode: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  assigneeUuid: z.uuid().nullable().optional(),
});

export async function GET(
  _: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  const ticket = await getTicket(uuid, user);
  if (!ticket)
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  return NextResponse.json({ data: ticket });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const isAgent = user.role === "admin" || user.role === "worker";
  if (!isAgent)
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.flattenError(parsed.error) },
      { status: 400 },
    );
  }

  const { uuid } = await params;
  const { statusCode, priorityCode, assigneeUuid } = parsed.data;

  const existing = await getTicket(uuid, user);
  if (!existing)
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  const isAdmin = user.role === "admin";

  if (assigneeUuid !== undefined && !isAdmin) {
    return NextResponse.json(
      { error: "Только администратор может менять исполнителя" },
      { status: 403 },
    );
  }

  if (statusCode) {
    await changeStatus({
      ticketUuid: uuid,
      statusCode,
      changedByUuid: user.uuid,
    });

    await logActivity({
      actorUuid: user.uuid,
      targetType: "ticket",
      targetId: uuid,
      action: "status_change",
      ticketUuid: uuid,
      meta: {
        title: existing.title,
        from: existing.statuses?.code ?? null,
        to: statusCode,
      },
    });
  }

  if (priorityCode) {
    await changePriority({ ticketUuid: uuid, priorityCode });

    await logActivity({
      actorUuid: user.uuid,
      targetType: "ticket",
      targetId: uuid,
      action: "update",
      ticketUuid: uuid,
      meta: {
        title: existing.title,
        field: "priority",
        from: existing.priorities?.code ?? null,
        to: priorityCode,
      },
    });
  }

  if (assigneeUuid !== undefined) {
    await assignTicket({ ticketUuid: uuid, assigneeUuid });

    let assigneeName: string | null = null;

    if (assigneeUuid) {
      const assignee = await prisma.users.findUnique({
        where: {
          uuid: assigneeUuid,
        },
        select: {
          full_name: true,
          username: true,
        },
      });

      assigneeName = assignee?.full_name || assignee?.username || null;
    }

    await logActivity({
      actorUuid: user.uuid,
      targetType: "ticket",
      targetId: uuid,
      action: "assign",
      ticketUuid: uuid,
      meta: {
        title: existing.title,
        actorName: user.full_name || user.username,
        assigneeName,
        from: existing.assignee?.uuid ?? null,
        to: assigneeUuid,
        isInternal: false,
      },
    });
  }

  const updated = await getTicket(uuid, user);
  return NextResponse.json({ data: updated });
}
