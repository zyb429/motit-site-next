// src/app/api/debug-prisma/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  const prisma = new PrismaClient();
  const model = (prisma as any)._runtimeDataModel?.models?.ticket_attachments;
  const fields = model?.fields?.map((f: any) => `${f.name}:${f.kind}`) ?? [];

  await prisma.$disconnect();

  return NextResponse.json({
    resolved: require.resolve("@prisma/client"),
    fields,
    has_comment_uuid: fields.some((f: string) => f.startsWith("comment_uuid:")),
    has_comments: fields.some((f: string) => f.startsWith("comments:")),
  });
}
