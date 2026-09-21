// src/app/api/tickets/statuses/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listStatuses } from "@/lib/db/tickets";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const items = await listStatuses();
  return NextResponse.json({ data: items });
}
