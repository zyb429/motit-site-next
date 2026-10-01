// src/app/api/chat/chats/[uuid]/members/[userUuid]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { removeChatMember, changeMemberRole } from "@/lib/db/chat";
import { redis } from "@/lib/redis";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ uuid: string; userUuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid, userUuid } = await params;

  try {
    const { systemMessage } = await removeChatMember(uuid, userUuid, user.uuid);

    // System message в чат (для всех, кто ещё в нём)
    await redis.publish(`chat:${uuid}:messages`, JSON.stringify(systemMessage));

    // Персональное событие удалённому пользователю
    await redis.publish(
      `user:${userUuid}:chats`,
      JSON.stringify({ event: "chat:removed", chatUuid: uuid }),
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка" },
      { status: 400 },
    );
  }
}

const patchSchema = z.object({
  role: z.enum(["admin", "member"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uuid: string; userUuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid, userUuid } = await params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  try {
    const updated = await changeMemberRole({
      chatUuid: uuid,
      targetUuid: userUuid,
      byUuid: user.uuid,
      role: parsed.data.role,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка" },
      { status: 400 },
    );
  }
}
