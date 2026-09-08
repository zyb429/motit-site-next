import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Проверяем наличие токена в куках
  const token = request.cookies.get("strapi_jwt")?.value;
  const pathname = request.nextUrl.pathname;

  // Защищенные маршруты
  const protectedPaths = ["/admin", "/dashboard", "/profile"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  // Если пользователь не авторизован и пытается зайти на защищенный маршрут
  if (!token && isProtectedPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Если пользователь авторизован и пытается зайти на /login
  if (token && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/profile/:path*", "/login"],
};
