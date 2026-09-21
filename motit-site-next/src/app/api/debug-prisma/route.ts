// src/app/api/debug-prisma/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const model = (
    prisma as unknown as {
      _runtimeDataModel?: {
        models?: Record<string, { fields?: { name: string; kind: string }[] }>;
      };
    }
  )._runtimeDataModel?.models?.ticket_attachments;

  const fields = model?.fields?.map((f) => `${f.name}:${f.kind}`) ?? [];

  return NextResponse.json({
    resolved: require.resolve("@prisma/client"),
    fields,
    has_comment_uuid: fields.some((f) => f.startsWith("comment_uuid:")),
    has_comments: fields.some((f) => f.startsWith("comments:")),
  });
}
