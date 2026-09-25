import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { toggleReaction } from "@/lib/db/chat";
import { prisma } from "@/lib/prisma";

const schema = z.object({ emoji: z.string().min(1).max(10) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Неверные данные" }, { status: 400 });

  await toggleReaction(uuid, user.uuid, parsed.data.emoji);

  const reactions = await prisma.chat_reactions.findMany({
    where: { message_uuid: uuid },
    select: { emoji: true, user_uuid: true },
  });

  return NextResponse.json({ data: reactions });
}
