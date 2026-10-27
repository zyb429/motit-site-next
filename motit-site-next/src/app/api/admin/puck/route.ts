import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { savePuckDoc } from "@/lib/db/puck";
import type { Data } from "@puckeditor/core";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { key, data } = body as { key: string; data: Data };

  if (!key || !data) {
    return NextResponse.json(
      { error: "key и data обязательны" },
      { status: 400 },
    );
  }

  await savePuckDoc(key, data, user.id);
  return NextResponse.json({ ok: true });
}