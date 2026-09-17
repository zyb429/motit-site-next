// src/app/api/admin/roles/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const API_TOKEN = process.env.STRAPI_API_TOKEN || "";

export async function GET() {
  const admin = await getCurrentUser();
  if (!admin || !admin.isAdmin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const res = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Ошибка Strapi" },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
