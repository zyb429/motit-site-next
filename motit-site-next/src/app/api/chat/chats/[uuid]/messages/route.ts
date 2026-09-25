// src/app/api/chat/chats/[uuid]/messages/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getMessages, sendMessage } from "@/lib/db/chat";
import { redis } from "@/lib/redis";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  const url = new URL(req.url);
  const before = url.searchParams.get("before") ?? undefined;
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);

  try {
    const messages = await getMessages(uuid, user.uuid, { before, limit });
    return NextResponse.json({ data: messages });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

const sendSchema = z.object({
  content: z.string().max(10_000).default(""),
  kind: z.enum(["text", "file", "system"]).default("text"),
  replyToUuid: z.uuid().optional(),
  attachmentFileIds: z.array(z.number().int().positive()).max(10).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  const parsed = sendSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: z.flattenError(parsed.error) }, { status: 400 });
  }

  try {
    const message = await sendMessage({
      chatUuid: uuid,
      userUuid: user.uuid,
      content: parsed.data.content,
      kind: parsed.data.kind,
      replyToUuid: parsed.data.replyToUuid,
      attachmentFileIds: parsed.data.attachmentFileIds,
    });

    // Broadcast через Redis
    await redis.publish(`chat:${uuid}:messages`, JSON.stringify(message));

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка отправки";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
