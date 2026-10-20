// src/app/api/health/live/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  return NextResponse.json(
    { status: "ok", uptime: process.uptime() },
    { headers: { "Cache-Control": "no-store" } },
  );
}