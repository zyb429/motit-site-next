// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { checkAll, isAuthorized, redact } from "@/lib/health";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Короткий in-memory кэш, чтобы мониторинг (Docker + Uptime Kuma) не гонял
// S3+Redis+pub/sub несколько раз в секунду.
let cache: { at: number; body: unknown; code: number } | null = null;
const TTL_MS = 5000;

export async function GET(req: Request) {
  const headers = { "Cache-Control": "no-store" } as const;

  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.body, { status: cache.code, headers });
  }

  const raw = await checkAll();
  const showDetail = process.env.HEALTH_DETAILS === "1" || isAuthorized(req);
  const checks = redact(raw, showDetail);
  const allOk = Object.values(raw).every((c) => c.status === "ok");

  const body = {
    status: allOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  };
  const code = allOk ? 200 : 503;

  cache = { at: Date.now(), body, code };
  return NextResponse.json(body, { status: code, headers });
}