// src/app/api/posts/check-slug/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Не авторизован" },
      { status: 401 },
    );
  }

  const slug = request.nextUrl.searchParams.get("slug")?.trim();

  if (!slug) {
    return NextResponse.json({
      available: false,
      message: "Slug не указан",
    });
  }

  const existing = await prisma.posts.findFirst({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  return NextResponse.json({
    available: !existing,
  });
}