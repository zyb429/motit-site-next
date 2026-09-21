// src/app/api/tickets/priorities/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listPriorities } from "@/lib/db/tickets";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const items = await listPriorities();
  return NextResponse.json({ data: items });
}
