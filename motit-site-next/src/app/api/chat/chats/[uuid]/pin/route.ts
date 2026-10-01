import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { togglePinChat } from "@/lib/db/chat";
import { redis } from "@/lib/redis";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;

  try {
    const result = await togglePinChat(uuid, user.uuid);

    await redis.publish(
      `user:${user.uuid}:chats`,
      JSON.stringify({
        event: "chat:updated",
        chatUuid: uuid,
        patch: { is_pinned: result.is_pinned },
      }),
    );

    return NextResponse.json({ success: true, is_pinned: result.is_pinned });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка" },
      { status: 400 },
    );
  }
}
