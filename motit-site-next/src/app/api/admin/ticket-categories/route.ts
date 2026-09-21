// src/app/api/admin/ticket-categories/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  createTicketCategory,
  listTicketCategories,
} from "@/lib/db/ticket-categories";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const items = await listTicketCategories({ includeInactive: true });
  return NextResponse.json({ data: items });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const created = await createTicketCategory(parsed.data);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Категория с таким slug уже существует" },
      { status: 400 },
    );
  }
}
