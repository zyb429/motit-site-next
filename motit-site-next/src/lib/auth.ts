// src/lib/auth.ts
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export type UserRole = "admin" | "client" | "worker" | "statistics";

export type CurrentUser = {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string | null;
  bio?: string | null;
  role: UserRole | null;
  isAdmin: boolean;
  isWorker: boolean;
  isClient: boolean;
  isStatistics: boolean;
};

function parseRole(rawRole: any): UserRole | null {
  if (!rawRole) return null;
  const role = rawRole.data?.attributes ?? rawRole;
  const name = (role.name ?? role.type ?? role).toString().toLowerCase();
  if (name === "admin") return "admin";
  if (name === "client" || name === "authenticated") return "client";
  if (name === "worker" || name === "support") return "worker";
  if (name === "statistics") return "statistics";
  return null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("strapi_jwt")?.value;

    if (!token) {
      console.log("[getCurrentUser] no token");
      return null;
    }

    const url = `${STRAPI_URL}/api/users/me?populate[role]=*&populate[avatar]=*`;
    console.log("[getCurrentUser] fetch:", url);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    console.log("[getCurrentUser] status:", res.status);
    if (!res.ok) return null;

    const user = await res.json();
    const role = parseRole(user.role);
    console.log("[getCurrentUser] user:", user.username, "role:", role);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar?.url ?? null,
      bio: user.bio ?? null,
      role,
      isAdmin: role === "admin",
      isWorker: role === "worker",
      isClient: role === "client",
      isStatistics: role === "statistics",
    };
  } catch (err) {
    console.error("[getCurrentUser] error:", err);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
