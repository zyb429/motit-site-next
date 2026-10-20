// src/app/api/health/smtp/route.ts
import { NextResponse } from "next/server";
import net from "node:net";
import tls from "node:tls";
import { isAuthorized } from "@/lib/health";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function smtpHandshake(): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = port === 465 || process.env.SMTP_SECURE === "true";
  if (!host) throw new Error("SMTP_HOST not set");

  await new Promise<void>((resolve, reject) => {
    const sock = secure
      ? tls.connect({ host, port, timeout: 4000 })
      : net.createConnection({ host, port, timeout: 4000 });

    sock.once("data", (buf) => {
      const banner = buf.toString();
      if (banner.startsWith("220")) resolve();
      else reject(new Error(`unexpected SMTP banner: ${banner.trim()}`));
      sock.destroy();
    });
    sock.once("error", reject);
    sock.once("timeout", () => {
      sock.destroy();
      reject(new Error("SMTP timeout"));
    });
  });
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { status: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  try {
    await smtpHandshake();
    return NextResponse.json(
      { status: "ok" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      {
        status: "fail",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}