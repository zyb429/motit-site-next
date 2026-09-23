// src/proxy.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const isAuthed = !!session?.user;
  const role = session?.user?.role ?? null;
  const pathname = req.nextUrl.pathname;

  // /login для залогиненных → в /cabinet (или в from)
  if (pathname === "/login" && isAuthed) {
    const from = req.nextUrl.searchParams.get("from");
    if (from) return NextResponse.redirect(new URL(from, req.url));
    return NextResponse.redirect(new URL("/cabinet", req.url));
  }

  // /admin — admin и worker
  if (pathname.startsWith("/admin")) {
    if (!isAuthed) {
      const url = new URL("/login", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "admin" && role !== "worker") {
      return NextResponse.redirect(new URL("/cabinet", req.url));
    }
  }

  // /cabinet — любой авторизованный
  if (pathname.startsWith("/cabinet")) {
    if (!isAuthed) {
      const url = new URL("/login", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    // admin / worker / client / statistics — все пускаются
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/cabinet/:path*", "/login"],
};
