// src/app/api/chat/messages/[uuid]/forward/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { forwardMessage } from "@/lib/db/chat";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const schema = z.object({
  targetChatUuids: z.array(z.uuid()).min(1).max(20),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  }

  try {
    const result = await forwardMessage({
      messageUuid: uuid,
      targetChatUuids: parsed.data.targetChatUuids,
      userUuid: user.uuid,
    });

    // Broadcast — в каждый целевой чат отправим событие message:new
    for (const chatUuid of parsed.data.targetChatUuids) {
      const created = await prisma.chat_messages.findFirst({
        where: { chat_uuid: chatUuid, user_uuid: user.uuid },
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: { uuid: true, full_name: true, username: true, avatar_url: true },
          },
          attachments: { include: { file: true } },
          reactions: { select: { emoji: true, user_uuid: true } },
          read_receipts: { select: { user_uuid: true, read_at: true } },
        },
      });

      if (created) {
        await redis.publish(
          `chat:${chatUuid}:messages`,
          JSON.stringify(created),
        );
      }
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
