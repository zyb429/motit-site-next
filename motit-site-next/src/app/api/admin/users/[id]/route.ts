// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const API_TOKEN = process.env.STRAPI_API_TOKEN || "";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { roleId, blocked, full_name, phone } = body;

  const cookieStore = await cookies();
  const jwt = cookieStore.get("strapi_jwt")?.value;
  if (!jwt) {
    return NextResponse.json({ error: "Нет JWT" }, { status: 401 });
  }

  // Смена роли
  if (roleId !== undefined) {
    const res = await fetch(`${STRAPI_URL}/api/admin-users/${id}/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roleId }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: result.error?.message || "Ошибка смены роли" },
        { status: res.status },
      );
    }
    return NextResponse.json(result);
  }

  // Остальные поля (blocked, full_name, phone)
  const data: Record<string, unknown> = {};
  if (blocked !== undefined) data.blocked = blocked;
  if (full_name !== undefined) data.full_name = full_name;
  if (phone !== undefined) data.phone = phone;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Нет данных" }, { status: 400 });
  }

  const res = await fetch(`${STRAPI_URL}/api/admin-users/${id}/update`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: result.error?.message || "Ошибка обновления" },
      { status: res.status },
    );
  }

  return NextResponse.json(result);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await params;

  if (String(admin.id) === String(id)) {
    return NextResponse.json(
      { error: "Нельзя удалить самого себя" },
      { status: 400 },
    );
  }

  const res = await fetch(`${STRAPI_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Ошибка удаления" },
      { status: res.status },
    );
  }

  return NextResponse.json({ success: true });
}
