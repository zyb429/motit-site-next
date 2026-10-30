import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const UPSTREAM =
  process.env.S3_PROXY_TARGET ?? "http://localhost:9000/motit-uploads";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const target = `${UPSTREAM}/${path.join("/")}`;

  const upstream = await fetch(target, { cache: "no-store" });
  if (!upstream.ok) {
    return new Response(upstream.body, { status: upstream.status });
  }

  // Прокидываем контент-тип и длину, чтобы <img> и браузер не ругались
  const headers = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  const cl = upstream.headers.get("content-length");
  if (cl) headers.set("content-length", cl);
  headers.set("cache-control", "public, max-age=300");

  return new Response(upstream.body, { status: 200, headers });
}