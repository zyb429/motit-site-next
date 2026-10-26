import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { savePuckDoc } from "@/lib/db/puck";

const ALLOWED = new Set(["puck_header", "puck_footer", "puck_home"]);

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { key, data } = body as { key?: string; data?: unknown };
  if (!key || !ALLOWED.has(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }
  if (!data || typeof data !== "object" || !Array.isArray((data as any).content)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await savePuckDoc(key, data as any, user.id);
  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  return NextResponse.json({ ok: true });
}