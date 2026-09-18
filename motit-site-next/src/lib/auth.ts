// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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

function parseRole(rawType: string | null | undefined): UserRole | null {
  if (!rawType) return null;
  const t = rawType.toLowerCase();
  if (t === "admin") return "admin";
  if (t === "client" || t === "authenticated") return "client";
  if (t === "worker" || t === "support") return "worker";
  if (t === "statistics") return "statistics";
  return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email или username", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!identifier || !password) return null;

        // identifier может быть email или username
        const user = await prisma.users.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
          include: {
            users_role_lnk: { include: { up_roles: true } },
          },
        });

        if (!user) return null;
        if (user.blocked) return null;
        if (!user.password) return null;

        // пароли из Strapi — bcrypt
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        const roleType = user.users_role_lnk?.[0]?.up_roles?.type ?? null;
        const role = parseRole(roleType);

        return {
          id: String(user.id),
          name: user.username ?? "",
          email: user.email ?? "",
          username: user.username ?? "",
          full_name: user.full_name ?? "",
          phone: user.phone ?? "",
          bio: user.bio ?? null,
          avatar_url: null,
          roleType,
          role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = Number(u.id);
        token.username = u.username;
        token.full_name = u.full_name;
        token.phone = u.phone;
        token.bio = u.bio;
        token.avatar_url = u.avatar_url;
        token.roleType = u.roleType;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any) = {
        ...(session.user as any),
        id: token.id as number,
        username: token.username,
        full_name: token.full_name,
        phone: token.phone,
        bio: token.bio,
        avatar_url: token.avatar_url,
        roleType: token.roleType,
        role: token.role,
      };
      return session;
    },
  },
});

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await auth();
    const u = session?.user as any;
    if (!u || !u.id) return null;

    const role = (u.role as UserRole | null) ?? null;

    return {
      id: u.id,
      username: u.username ?? "",
      email: u.email ?? "",
      full_name: u.full_name || undefined,
      phone: u.phone || undefined,
      avatar_url: u.avatar_url ?? null,
      bio: u.bio ?? null,
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
