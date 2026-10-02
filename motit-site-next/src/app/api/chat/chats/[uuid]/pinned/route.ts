// src/app/api/chat/chats/[uuid]/pinned/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listPinnedMessages } from "@/lib/db/chat";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { uuid } = await params;

  try {
    const pinned = await listPinnedMessages(uuid, user.uuid);
    return NextResponse.json({ data: pinned });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка";
    const status = msg.includes("Нет доступа") ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
