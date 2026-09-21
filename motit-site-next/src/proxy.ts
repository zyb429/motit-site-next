import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const isAuthed = !!session?.user;
  const pathname = req.nextUrl.pathname;

  // Уже залогинен и зашёл на /login → вернуть на from или в /admin
  if (pathname === "/login" && isAuthed) {
    const from = req.nextUrl.searchParams.get("from");
    return NextResponse.redirect(new URL(from || "/admin", req.url));
  }

  // Защищаем /admin
  if (pathname.startsWith("/admin") && !isAuthed) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
