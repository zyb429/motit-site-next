import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const patchSchema = z.object({
  content: z.string().min(1).max(10_000),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  const message = await prisma.chat_messages.findUnique({ where: { uuid } });
  if (!message || message.user_uuid !== user.uuid) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const updated = await prisma.chat_messages.update({
    where: { uuid },
    data: { content: parsed.data.content, edited_at: new Date() },
    include: {
      user: { select: { uuid: true, full_name: true, username: true, avatar_url: true } },
      attachments: { include: { file: true } },
      reactions: true,
      read_receipts: true,
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") === "everyone" ? "everyone" : "self";

  const message = await prisma.chat_messages.findUnique({
    where: { uuid },
    select: { user_uuid: true, chat_uuid: true },
  });
  if (!message) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  if (scope === "everyone") {
    if (message.user_uuid !== user.uuid) {
      return NextResponse.json(
        { error: "Только автор может удалить для всех" },
        { status: 403 },
      );
    }

    await prisma.chat_messages.update({
      where: { uuid },
      data: { deleted_at: new Date(), content: "" },
    });

    // Оповещаем чат через WebSocket
    await redis.publish(
      `chat:${message.chat_uuid}:messages`,
      JSON.stringify({
        event: "message:deleted",
        messageUuid: uuid,
      }),
    );

    return NextResponse.json({ data: { scope: "everyone" } });
  }

  // scope === "self" — создаём запись удаления
  await prisma.chat_message_deletions.upsert({
    where: {
      message_uuid_user_uuid: {
        message_uuid: uuid,
        user_uuid: user.uuid,
      },
    },
    create: {
      message_uuid: uuid,
      user_uuid: user.uuid,
      created_at: new Date(),
    },
    update: {},
  });

  return NextResponse.json({ data: { scope: "self" } });
}
