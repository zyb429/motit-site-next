// src/app/api/tickets/[uuid]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getTicket, changeStatus, assignTicket, changePriority } from "@/lib/db/tickets";

const patchSchema = z.object({
  statusCode: z.enum(["OPEN", "IN_PROGRESS", "WAITING_CLIENT", "RESOLVED", "CLOSED"]).optional(),
  priorityCode: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  assigneeUuid: z.uuid().nullable().optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  const ticket = await getTicket(uuid, user);
  if (!ticket) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  return NextResponse.json({ data: ticket });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const isAgent = user.role === "admin" || user.role === "worker";
  if (!isAgent) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.flattenError(parsed.error) },
      { status: 400 },
    );
  }

  const { uuid } = await params;
  const { statusCode, priorityCode, assigneeUuid } = parsed.data;

  // проверяем, что тикет существует и доступен
  const existing = await getTicket(uuid, user);
  if (!existing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  const isAdmin = user.role === "admin";

  if (statusCode) {
    await changeStatus({
      ticketUuid: uuid,
      statusCode,
      changedByUuid: user.uuid,
    });
  }
  if (priorityCode) await changePriority({ ticketUuid: uuid, priorityCode });

  if (assigneeUuid !== undefined) {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Только администратор может менять исполнителя" },
        { status: 403 },
      );
    }
    await assignTicket({ ticketUuid: uuid, assigneeUuid });
  }

  // читаем финальное состояние с полным include
  const updated = await getTicket(uuid, user);
  return NextResponse.json({ data: updated });
}
