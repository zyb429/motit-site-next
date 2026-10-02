// src/app/api/chat/chats/[uuid]/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateChat, deleteChat } from "@/lib/db/chat";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    const chat = await updateChat({
      chatUuid: uuid,
      byUuid: user.uuid,
      name: body.name,
      description: body.description,
      avatar_url: body.avatar_url,
    });
    return NextResponse.json({ success: true, data: chat });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;

  // scope можно передать в query (?scope=self|everyone)
  // или в теле { scope: "self" | "everyone" }.
  const url = new URL(req.url);
  let scope: "self" | "everyone" | undefined;
  const qs = url.searchParams.get("scope");
  if (qs === "self" || qs === "everyone") {
    scope = qs;
  } else {
    const body = await req.json().catch(() => ({}));
    const b = (body as { scope?: unknown }).scope;
    if (b === "self" || b === "everyone") scope = b;
  }

  try {
    const result = await deleteChat(uuid, user.uuid, scope);

    // Если удалено для всех — оповестить всех участников
    if (result.scope === "everyone") {
      const members = await prisma.chat_members.findMany({
        where: { chat_uuid: uuid },
        select: { user_uuid: true },
      });

      await Promise.all(
        members.map((m) =>
          redis.publish(
            `user:${m.user_uuid}:chats`,
            JSON.stringify({ event: "chat:removed", chatUuid: uuid }),
          ),
        ),
      );
    }

    return NextResponse.json({ success: true, scope: result.scope });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка" },
      { status: 400 },
    );
  }
}
