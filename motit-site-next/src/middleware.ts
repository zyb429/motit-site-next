import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("strapi_jwt")?.value;
  const pathname = request.nextUrl.pathname;

  console.log(`[Middleware] ${pathname} - Token: ${token ? "✅" : "❌"}`);

  // ✅ Если на главной и есть токен - редирект на /admin
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // ✅ Если на /login и есть токен - редирект на /admin
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // ✅ Защищаем /admin
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/login"],
};
