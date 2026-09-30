// src/app/api/chat/chats/[uuid]/transfer-ownership/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { transferOwnership } from "@/lib/db/chat";

const schema = z.object({
  toUuid: z.uuid(),   // Zod v4
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { uuid } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  try {
    const result = await transferOwnership({
      chatUuid: uuid,
      fromUuid: user.uuid,
      toUuid: parsed.data.toUuid,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка" },
      { status: 400 },
    );
  }
}
