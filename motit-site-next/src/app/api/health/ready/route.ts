// src/app/api/health/ready/route.ts
import { NextResponse } from "next/server";
import { checkAll, isAuthorized, redact } from "@/lib/health";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const raw = await checkAll();
  const showDetail = process.env.HEALTH_DETAILS === "1" || isAuthorized(req);
  const checks = redact(raw, showDetail);
  const allOk = Object.values(raw).every((c) => c.status === "ok");

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: allOk ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}