// src/app/api/chat/chats/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  listChatsForUser,
  getOrCreateDirectChat,
  createGroupChat,
  createChannel,
} from "@/lib/db/chat";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const chats = await listChatsForUser(user.uuid);
  return NextResponse.json({ data: chats });
}

const createSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("direct"),
    userUuid: z.uuid(),
  }),
  z.object({
    kind: z.literal("group"),
    name: z.string().min(1).max(255),
    description: z.string().max(500).optional(),
    memberUuids: z.array(z.uuid()).min(1).max(100),
  }),
  z.object({
    kind: z.literal("channel"),
    name: z.string().min(1).max(255),
    description: z.string().max(500).optional(),
    isPrivate: z.boolean().default(false),
  }),
]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: z.flattenError(parsed.error) }, { status: 400 });
  }

  try {
    const data = parsed.data;

    if (data.kind === "direct") {
      const chat = await getOrCreateDirectChat(user.uuid, data.userUuid);
      return NextResponse.json({ data: chat }, { status: 201 });
    }

    if (data.kind === "group") {
      const chat = await createGroupChat({
        name: data.name,
        description: data.description,
        creatorUuid: user.uuid,
        memberUuids: data.memberUuids,
      });
      return NextResponse.json({ data: chat }, { status: 201 });
    }

    if (data.kind === "channel") {
      const chat = await createChannel({
        name: data.name,
        description: data.description,
        creatorUuid: user.uuid,
        isPrivate: data.isPrivate,
      });
      return NextResponse.json({ data: chat }, { status: 201 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка создания чата";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
