// src/app/account/avatar/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { s3, S3_BUCKET, publicUrl } from "@/lib/s3";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Только изображения" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Файл больше 5 МБ" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const key = `avatars/${user.id}/${randomUUID()}.${ext}`;

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
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return NextResponse.json({
    id: created.id,
    documentId: created.document_id ?? null,
    url,
    name: created.name ?? "",
  });
}
