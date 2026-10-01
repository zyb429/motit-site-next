// src/app/api/chat/chats/[uuid]/attachments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/db/chat";
import { uploadToS3 } from "@/lib/s3";
import { redis } from "@/lib/redis";                          // ← добавлено

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { uuid: chatUuid } = await params;

  const member = await prisma.chat_members.findUnique({
    where: { chat_uuid_user_uuid: { chat_uuid: chatUuid, user_uuid: user.uuid } },
  });
  if (!member) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  const content = ((form.get("content") as string) ?? "").trim();
  const replyToUuid = (form.get("replyToUuid") as string) || undefined;

  if (files.length === 0 && !content) {
    return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
  }

  const fileIds: number[] = [];

  for (const file of files) {
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const key = `chat/${chatUuid}/${randomUUID()}-${safeName}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";

    const url = await uploadToS3({ key, body: buf, contentType: mime });

    const created = await prisma.files.create({
      data: {
        uuid: randomUUID(),
        name: file.name,
        url,
        mime,
        size: file.size,
        ext: safeName.includes(".") ? safeName.split(".").pop()!.toLowerCase() : null,
        provider: "s3",
        folder_path: `chat/${chatUuid}`,
        created_at: new Date(),
        updated_at: new Date(),
      },
      select: { id: true },
    });

    fileIds.push(created.id);
  }

  const message = await sendMessage({
    chatUuid,
    userUuid: user.uuid,
    content,
    kind: files.length > 0 ? "file" : "text",
    replyToUuid,
    attachmentFileIds: fileIds.length > 0 ? fileIds : undefined,
  });

  // Broadcast через Redis — как в POST /messages
  await redis.publish(`chat:${chatUuid}:messages`, JSON.stringify(message));   // ← добавлено

  return NextResponse.json({ data: [message] });
}
