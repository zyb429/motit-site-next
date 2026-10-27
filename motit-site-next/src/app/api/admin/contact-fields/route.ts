import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const fieldSchema = z.object({
  name: z.string().min(1).regex(/^[a-z_][a-z0-9_]*$/),
  label: z.string().min(1),
  type: z.enum(["text", "email", "tel", "textarea", "number", "select"]),
  required: z.boolean().default(false),
  placeholder: z.string().optional().nullable(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional().nullable(),
  sortOrder: z.number().int().default(0),
  enabled: z.boolean().default(true),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fields = await prisma.contactFormField.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(fields);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = z.array(fieldSchema).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid fields", issues: parsed.error.issues }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.contactFormField.deleteMany({}),
    prisma.contactFormField.createMany({ data: parsed.data as any }),
  ]);

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}