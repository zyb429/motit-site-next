// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const API_TOKEN = process.env.STRAPI_API_TOKEN || "";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const roleFilter = url.searchParams.get("role") ?? "";

  const params = new URLSearchParams();
  params.set("populate[role]", "*");
  params.set("populate[avatar]", "*");
  params.set("sort[0]", "createdAt:desc");
  params.set("pagination[pageSize]", "100");
  if (q) {
    params.set("filters[$or][0][username][$containsi]", q);
    params.set("filters[$or][1][email][$containsi]", q);
    params.set("filters[$or][2][full_name][$containsi]", q);
  }
  if (roleFilter) {
    params.set("filters[role][name][$eq]", roleFilter);
  }

  const res = await fetch(`${STRAPI_URL}/api/users?${params}`, {
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
