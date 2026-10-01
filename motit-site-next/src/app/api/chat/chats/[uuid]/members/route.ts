import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { addChatMember } from "@/lib/db/chat";
import { redis } from "@/lib/redis";

const schema = z.object({
  userUuid: z.uuid(),
  showHistory: z.boolean().default(true),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  try {
    const { member, systemMessage } = await addChatMember(
      uuid,
      parsed.data.userUuid,
      user.uuid,
      { showHistory: parsed.data.showHistory },
    );

    await redis.publish(`chat:${uuid}:messages`, JSON.stringify(systemMessage));

    return NextResponse.json({ success: true, data: member });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка" },
      { status: 400 },
    );
  }
}
