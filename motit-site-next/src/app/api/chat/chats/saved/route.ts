// src/app/api/chat/chats/saved/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateSavedChat } from "@/lib/db/chat";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const chat = await getOrCreateSavedChat(user.uuid);
  return NextResponse.json({ data: chat });
}
