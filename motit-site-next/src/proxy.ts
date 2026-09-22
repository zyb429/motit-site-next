import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const isAuthed = !!session?.user;
  const role = session?.user?.role ?? null;
  const pathname = req.nextUrl.pathname;

  // Уже залогинен и зашёл на /login → вернуть в свой раздел
  if (pathname === "/login" && isAuthed) {
    const from = req.nextUrl.searchParams.get("from");
    if (from) return NextResponse.redirect(new URL(from, req.url));

    if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "worker") return NextResponse.redirect(new URL("/worker", req.url));
    return NextResponse.redirect(new URL("/cabinet", req.url));
  }

  // /admin — только админ
  if (pathname.startsWith("/admin")) {
    if (!isAuthed) {
      const url = new URL("/login", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "admin") {
      if (role === "worker") {
        return NextResponse.redirect(new URL("/worker", req.url));
      }
      return NextResponse.redirect(new URL("/cabinet", req.url));
    }
  }

  // /worker — работник или админ
  if (pathname.startsWith("/worker")) {
    if (!isAuthed) {
      const url = new URL("/login", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "worker" && role !== "admin") {
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
    // Опционально: админ и работник не должны заходить в клиентский кабинет
    if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "worker") return NextResponse.redirect(new URL("/worker", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/worker/:path*", "/cabinet/:path*", "/login"],
};
