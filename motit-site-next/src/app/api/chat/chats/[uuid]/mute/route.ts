// src/app/api/chat/chats/[uuid]/mute/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleMuteChat } from "@/lib/db/chat";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;

  try {
    const result = await toggleMuteChat(uuid, user.uuid);
    return NextResponse.json({ success: true, is_muted: result.is_muted });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка" },
      { status: 400 },
    );
  }
}
