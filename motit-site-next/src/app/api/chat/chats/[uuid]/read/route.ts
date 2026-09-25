// src/app/api/chat/chats/[uuid]/read/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markChatAsRead } from "@/lib/db/chat";
import { redis } from "@/lib/redis";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;

  try {
    const result = await markChatAsRead(uuid, user.uuid);

    // Оповещаем всех в чате, что пользователь прочитал сообщения
    if (result.markedCount > 0) {
      await redis.publish(
        `chat:${uuid}:read`,
        JSON.stringify({
          chatUuid: uuid,
          userUuid: user.uuid,
          readAt: new Date().toISOString(),
        }),
      );
    }

    return NextResponse.json({ success: true, markedCount: result.markedCount });
  } catch {
    return NextResponse.json({ error: "Ошибка" }, { status: 400 });
  }
}
