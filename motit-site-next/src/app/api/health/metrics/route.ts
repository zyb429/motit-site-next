// src/app/api/health/metrics/route.ts
import { NextResponse } from "next/server";
import { checkAll, isAuthorized } from "@/lib/health";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { status: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const checks = await checkAll();
  const lines: string[] = [];

  lines.push("# HELP health_check_status 1 if ok, 0 if fail");
  lines.push("# TYPE health_check_status gauge");
  for (const [name, r] of Object.entries(checks)) {
    lines.push(`health_check_status{check="${name}"} ${r.status === "ok" ? 1 : 0}`);
  }

  lines.push("# HELP health_check_latency_ms latency of the check");
  lines.push("# TYPE health_check_latency_ms gauge");
  for (const [name, r] of Object.entries(checks)) {
    lines.push(`health_check_latency_ms{check="${name}"} ${r.latencyMs}`);
  }

  return new NextResponse(lines.join("\n") + "\n", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}