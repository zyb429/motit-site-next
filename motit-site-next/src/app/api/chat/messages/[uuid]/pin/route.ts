// src/app/api/chat/messages/[uuid]/pin/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { pinMessage, unpinMessage } from "@/lib/db/chat";
import { redis } from "@/lib/redis";

type Scope = "self" | "everyone";

function parseScope(value: unknown): Scope {
  return value === "everyone" ? "everyone" : "self";
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { uuid } = await params;

  let scope: Scope = "self";
  try {
    const body = await req.json().catch(() => ({}));
    scope = parseScope((body as { scope?: unknown }).scope);
  } catch {
    // тело может быть пустым — считаем scope = "self"
  }

  try {
    const pinned = await pinMessage({ messageUuid: uuid, userUuid: user.uuid, scope });

    if (scope === "everyone") {
      await redis.publish(
        `chat:${pinned.message.chat_uuid}:messages`,
        JSON.stringify({
          event: "message:pinned",
          scope,
          chatUuid: pinned.message.chat_uuid,
          messageUuid: uuid,
          pinnedByUuid: user.uuid,
          pinnedAt: pinned.pinned_at,
          message: pinned.message,
        }),
      );
    }

    return NextResponse.json({ data: pinned }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка";
    const status = msg.includes("Нет доступа") ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { uuid } = await params;

  const url = new URL(req.url);
  let scope: Scope = parseScope(url.searchParams.get("scope"));
  if (!url.searchParams.has("scope")) {
    const body = await req.json().catch(() => ({}));
    scope = parseScope((body as { scope?: unknown }).scope);
  }

  try {
    const result = await unpinMessage({ messageUuid: uuid, userUuid: user.uuid, scope });

    if (scope === "everyone") {
      await redis.publish(
        `chat:${result.chatUuid}:messages`,
        JSON.stringify({
          event: "message:unpinned",
          scope,
          chatUuid: result.chatUuid,
          messageUuid: uuid,
          unpinnedByUuid: user.uuid,
        }),
      );
    }

    return NextResponse.json({ success: true, scope });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка";
    const status = msg.includes("Нет доступа") ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
