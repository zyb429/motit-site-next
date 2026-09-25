// src/app/api/chat/chats/[uuid]/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getChatByUuid } from "@/lib/db/chat";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  const chat = await getChatByUuid(uuid, user.uuid);
  if (!chat) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  return NextResponse.json({ data: chat });
}
