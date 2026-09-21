// src/app/api/tickets/[uuid]/comments/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { addComment, getTicket } from "@/lib/db/tickets";

const schema = z.object({
  content: z.string().min(1).max(10_000),
  isInternal: z.boolean().optional(),
  attachmentFileIds: z.array(z.number().int().positive()).max(5).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { uuid } = await params;
  const ticket = await getTicket(uuid, user);
  if (!ticket) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isAgent = user.role === "admin" || user.role === "worker";

  const comment = await addComment({
    ticketUuid: uuid,
    userUuid: user.uuid,
    content: parsed.data.content,
    isInternal: isAgent && !!parsed.data.isInternal,
    attachmentFileIds: parsed.data.attachmentFileIds,
  });

  return NextResponse.json({ data: comment }, { status: 201 });
}
