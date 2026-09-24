// src/app/api/account/password/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.flattenError(parsed.error) },
      { status: 400 },
    );
  }

  const dbUser = await prisma.users.findUnique({
    where: { id: user.id },
    select: { password_hash: true },
  });

  if (!dbUser?.password_hash) {
    return NextResponse.json({ error: "Пароль не установлен" }, { status: 400 });
  }

  const ok = await bcrypt.compare(parsed.data.currentPassword, dbUser.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "Неверный текущий пароль" }, { status: 400 });
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 10);

  await prisma.users.update({
    where: { id: user.id },
    data: { password_hash: hash, updated_at: new Date() },
  });

  return NextResponse.json({ success: true });
}
