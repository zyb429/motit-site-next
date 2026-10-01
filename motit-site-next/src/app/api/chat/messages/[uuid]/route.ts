// src/app/api/chat/messages/[uuid]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { deleteMessageForUser } from "@/lib/db/chat";

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

  // Broadcast в чат
  await redis.publish(
    `chat:${message.chat_uuid}:messages`,
    JSON.stringify({
      event: "message:edited",
      message: updated,
    }),
  );

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

  try {
    const result = await deleteMessageForUser(uuid, user.uuid, scope);

    if (scope === "everyone" && result.deletedBy) {
      await redis.publish(
        `chat:${result.chatUuid}:messages`,
        JSON.stringify({
          event: "message:deleted",
          messageUuid: uuid,
          deletedBy: result.deletedBy,
        }),
      );
    }

    return NextResponse.json({ data: { scope } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка" },
      { status: 400 },
    );
  }
}
