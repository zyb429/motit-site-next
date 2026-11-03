// src/app/api/link-preview/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  try {
    const target = new URL(url);
    if (!["http:", "https:"].includes(target.protocol)) {
      return NextResponse.json({ error: "invalid protocol" }, { status: 400 });
    }

    const res = await fetch(target.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MotitBot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "fetch failed" }, { status: 502 });
    }

    const html = await res.text();
    const head = html.slice(0, 200_000);

    const pick = (re: RegExp) => {
      const m = head.match(re);
      return m ? m[1].trim() : undefined;
    };

    const title =
      pick(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"]+)["']/i,
      ) ?? pick(/<title[^>]*>([^<]+)<\/title>/i);
    const description =
      pick(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"]+)["']/i,
      ) ??
      pick(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"]+)["']/i,
      );
    const image = pick(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"]+)["']/i,
    );
    const siteName = pick(
      /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"]+)["']/i,
    );
    const favicon =
      pick(
        /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"]+)["']/i,
      ) ?? `https://${target.hostname}/favicon.ico`;

    return NextResponse.json({
      data: { title, description, image, siteName, favicon },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}