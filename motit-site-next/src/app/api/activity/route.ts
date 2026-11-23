import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(
    Number(url.searchParams.get("pageSize") ?? 20),
    100,
  );

  const targetType = url.searchParams.get("targetType") ?? undefined;
  const action = url.searchParams.get("action") ?? undefined;
  const actorUuid = url.searchParams.get("actorUuid") ?? undefined;

  const isInternalFilter =
    user.role === "client"
      ? {
          meta: {
            path: ["isInternal"],
            equals: false,
          },
        }
      : {};

  const where = {
    ...isInternalFilter,
    ...(targetType ? { target_type: targetType } : {}),
    ...(action ? { action } : {}),
    ...(actorUuid ? { actor_uuid: actorUuid } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        actor: {
          select: {
            uuid: true,
            full_name: true,
            username: true,
          },
        },
      },
    }),
    prisma.activity.count({ where }),
  ]);

  return NextResponse.json({
    data: items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
