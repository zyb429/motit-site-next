import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("strapi_jwt");
  cookieStore.delete("token");

  return NextResponse.redirect(
    new URL(
      "/login",
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ),
  );
}
