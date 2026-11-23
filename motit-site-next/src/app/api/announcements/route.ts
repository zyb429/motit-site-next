import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

const createSchema = z.object({
  title: z.string().min(3).max(200),
  message: z.string().min(3).max(2000),
  audience: z
    .enum(["all", "admin", "worker", "client", "statistics"])
    .default("all"),
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const audience = user.role ?? "client";

  const announcements = await prisma.announcements.findMany({
    where: {
      is_active: true,
      OR: [{ audience: "all" }, { audience }],
    },
    orderBy: {
      created_at: "desc",
    },
    take: 20,
  });

  return NextResponse.json({
    data: announcements,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.flattenError(parsed.error) },
      { status: 400 },
    );
  }

  const announcement = await prisma.announcements.create({
    data: {
      uuid: randomUUID(),
      title: parsed.data.title,
      message: parsed.data.message,
      audience: parsed.data.audience,
      created_by_id: user.id,
    },
  });

  await logActivity({
    actorUuid: user.uuid,
    targetType: "announcement",
    targetId: announcement.id,
    action: "create",
    meta: {
      title: announcement.title,
      audience: announcement.audience,
      isInternal: true,
    },
  });

  return NextResponse.json({ data: announcement }, { status: 201 });
}
