import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleMuteChat } from "@/lib/db/chat";
import { redis } from "@/lib/redis";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;

  try {
    const result = await toggleMuteChat(uuid, user.uuid);

    // Broadcast всем вкладкам этого пользователя
    await redis.publish(
      `user:${user.uuid}:chats`,
      JSON.stringify({
        event: "chat:updated",
        chatUuid: uuid,
        patch: { is_muted: result.is_muted },
      }),
    );

    return NextResponse.json({ success: true, is_muted: result.is_muted });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка" },
      { status: 400 },
    );
  }
}
