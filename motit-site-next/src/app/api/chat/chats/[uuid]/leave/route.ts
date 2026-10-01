import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { createSystemMessage } from "@/lib/db/chat";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;

  const chat = await prisma.chats.findUnique({
    where: { uuid },
    select: { uuid: true, kind: true },
  });
  if (!chat) return NextResponse.json({ error: "Чат не найден" }, { status: 404 });
  if (chat.kind === "direct" || chat.kind === "saved") {
    return NextResponse.json({ error: "Из личного чата нельзя выйти" }, { status: 400 });
  }

  const me = await prisma.users.findUnique({
    where: { uuid: user.uuid },
    select: { full_name: true, username: true },
  });
  const name = me?.full_name ?? me?.username ?? "Кто-то";

  const systemMessage = await createSystemMessage({
    chatUuid: uuid,
    actorUuid: user.uuid,
    content: `${name} покинул(а) чат`,
  });

  await prisma.chat_members.deleteMany({
    where: { chat_uuid: uuid, user_uuid: user.uuid },
  });

  await redis.publish(`chat:${uuid}:messages`, JSON.stringify(systemMessage));

  return NextResponse.json({ success: true });
}
