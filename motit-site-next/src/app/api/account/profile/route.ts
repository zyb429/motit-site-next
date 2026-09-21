// src/app/api/account/profile/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.users.update({
    where: { id: user.id },
    data: {
      ...parsed.data,
      updated_at: new Date(),
    },
    select: {
      id: true,
      full_name: true,
      phone: true,
      bio: true,
    },
  });

  return NextResponse.json({ data: updated });
}
