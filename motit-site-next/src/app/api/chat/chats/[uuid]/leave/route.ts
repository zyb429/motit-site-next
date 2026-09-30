// src/app/api/chat/chats/[uuid]/leave/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { uuid } = await params;

  // Проверяем, что чат существует и пользователь в нём
  const chat = await prisma.chats.findUnique({
    where: { uuid },
    select: { uuid: true, kind: true },
  });
  if (!chat) {
    return NextResponse.json({ error: "Чат не найден" }, { status: 404 });
  }

  if (chat.kind === "direct" || chat.kind === "saved") {
    return NextResponse.json(
      { error: "Из личного чата нельзя выйти" },
      { status: 400 },
    );
  }

  // Удаляем пользователя из участников
  await prisma.chat_members.deleteMany({
    where: { chat_uuid: uuid, user_uuid: user.uuid },
  });

  return NextResponse.json({ success: true });
}
