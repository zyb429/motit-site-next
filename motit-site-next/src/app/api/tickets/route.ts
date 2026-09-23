// src/app/api/tickets/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTicket, listTickets } from "@/lib/db/tickets";

const createSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(10_000),
  priorityCode: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  categoryUuid: z.string().uuid().optional().nullable(),
  contactName: z.string().min(1).max(255),
  contactEmail: z.string().email().max(255),
  contactPhone: z.string().max(50).optional().nullable(),
  organizationUuid: z.string().uuid().optional().nullable(),
  attachmentFileIds: z.array(z.number().int().positive()).max(5).optional(),
  clientUuid: z.string().uuid().optional(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const url = new URL(req.url);
  const result = await listTickets({
    user,
    statusCode: url.searchParams.get("status") ?? undefined,
    priorityCode: url.searchParams.get("priority") ?? undefined,
    assigneeId: url.searchParams.get("assigneeId")
      ? Number(url.searchParams.get("assigneeId"))
      : undefined,
    clientUuid: url.searchParams.get("clientUuid") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    page: Number(url.searchParams.get("page") ?? 1),
    pageSize: Math.min(Number(url.searchParams.get("pageSize") ?? 20), 100),
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isAgent = user.isAdmin || user.isWorker;

  // Кто будет клиентом заявки
  let clientUuid = user.uuid;

  if (isAgent) {
    if (!parsed.data.clientUuid) {
      return NextResponse.json({ error: "Выберите клиента" }, { status: 400 });
    }
    const client = await prisma.users.findUnique({
      where: { uuid: parsed.data.clientUuid },
      select: { uuid: true, blocked: true },
    });
    if (!client || client.blocked) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 400 });
    }
    clientUuid = client.uuid;
  }

  // Проверка организации
  if (parsed.data.organizationUuid) {
    if (isAgent) {
      // Для агента: организация должна быть привязана к выбранному клиенту
      const link = await prisma.client_organizations.findFirst({
        where: {
          client_user_uuid: clientUuid,
          organization_uuid: parsed.data.organizationUuid,
        },
      });
      if (!link) {
        return NextResponse.json(
          { error: "Организация не привязана к выбранному клиенту" },
          { status: 400 },
        );
      }
    } else {
      // Для клиента: организация должна быть привязана к нему
      const link = await prisma.client_organizations.findFirst({
        where: {
          client_user_uuid: user.uuid,
          organization_uuid: parsed.data.organizationUuid,
        },
      });
      if (!link) {
        return NextResponse.json(
          { error: "Организация не привязана к вашему аккаунту" },
          { status: 400 },
        );
      }
    }
  }

  const ticket = await createTicket({
    ...parsed.data,
    clientUuid,
    createdById: user.id, // ← кто физически создал тикет
  });

  return NextResponse.json({ data: ticket }, { status: 201 });
}
