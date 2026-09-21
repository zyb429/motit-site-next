// src/app/api/account/avatar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { s3, S3_BUCKET, publicUrl } from "@/lib/s3";

const MAX_SIZE = 3 * 1024 * 1024; // 3 МБ

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Только изображения" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Файл больше 3 МБ" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const key = `avatars/${user.id}-${randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  const url = publicUrl(key);

  const created = await prisma.files.create({
    data: {
      document_id: randomUUID(),
      name: file.name,
      mime: file.type,
      size: file.size,
      url,
      provider: "s3",
      folder_path: "avatars",
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  await prisma.users.update({
    where: { id: user.id },
    data: {
      avatar_id: created.id,
      avatar_url: url,
      updated_at: new Date(),
    },
  });

  return NextResponse.json({
    data: { id: created.id, url, name: created.name },
  });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  await prisma.users.update({
    where: { id: user.id },
    data: { avatar_id: null, avatar_url: null, updated_at: new Date() },
  });

  return NextResponse.json({ success: true });
}
