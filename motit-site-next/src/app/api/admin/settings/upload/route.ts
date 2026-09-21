// src/app/api/admin/settings/upload/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getAllowedMime, setAllowedMime } from "@/lib/settings";

const patchSchema = z.object({
  mime: z.array(z.string().min(1)).max(200),
});

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const mime = await getAllowedMime();
  return NextResponse.json({ data: { mime } });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await setAllowedMime(parsed.data.mime);
  return NextResponse.json({ success: true });
}
