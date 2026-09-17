// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("strapi_jwt");
  cookieStore.delete("token");
}

export async function POST() {
  await logout();
  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  await logout();
  return NextResponse.redirect(new URL("/login", request.url));
}
