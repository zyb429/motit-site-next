// src/app/api/admin/ticket-categories/[uuid]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  deleteTicketCategory,
  updateTicketCategory,
} from "@/lib/db/ticket-categories";

const patchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(2000).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const { uuid } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await updateTicketCategory(uuid, parsed.data);
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const { uuid } = await params;
  try {
    await deleteTicketCategory(uuid);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Не удалось удалить (возможно, есть привязанные тикеты)" },
      { status: 400 },
    );
  }
}
