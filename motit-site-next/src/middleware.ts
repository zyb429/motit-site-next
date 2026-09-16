import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("strapi_jwt")?.value;
  const pathname = request.nextUrl.pathname;

  console.log(`[Middleware] ${pathname} - Token: ${token ? "✅" : "❌"}`);

  // Уже залогинен и зашёл на /login → вернуть на from или в /admin
  if (pathname === "/login" && token) {
    const from = request.nextUrl.searchParams.get("from");
    return NextResponse.redirect(new URL(from || "/admin", request.url));
  }

  // Защищаем /admin
  if (pathname.startsWith("/admin") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
