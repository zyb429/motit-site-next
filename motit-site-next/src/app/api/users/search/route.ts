import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const users = await prisma.users.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: query } },
              { email: { contains: query } },
              { full_name: { contains: query } },
            ],
          },
          {
            id: {
              not: currentUser.id,
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        avatar_url: true,
      },
      take: 8,
      orderBy: {
        username: "asc",
      },
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("[api/users/search] error:", error);
    return NextResponse.json({ error: "Ошибка поиска" }, { status: 500 });
  }
}