// src/app/api/chat/chats/[uuid]/read/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markChatAsRead } from "@/lib/db/chat";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  try {
    await markChatAsRead(uuid, user.uuid);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка" }, { status: 400 });
  }
}
