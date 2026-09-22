// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type UserRole = "admin" | "client" | "worker" | "statistics";

export type CurrentUser = {
  id: number;
  uuid: string;
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
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",

  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email или username", type: "text" },
        password: { label: "Пароль", type: "password" },
      },

      async authorize(credentials) {
        console.log("[authorize] START, credentials =", {
          identifier: credentials?.identifier,
          hasPassword: !!credentials?.password,
        });

        const identifier = String(credentials?.identifier ?? "").trim();
        const password = String(credentials?.password ?? "");

        if (!identifier || !password) {
          console.log("[authorize] FAIL: empty identifier or password");
          return null;
        }

        const user = await prisma.users.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
          include: {
            users_role_lnk: { include: { roles: true } },
          },
        });

        console.log("[authorize] user lookup:", {
          found: !!user,
          id: user?.id,
          email: user?.email,
          username: user?.username,
          blocked: user?.blocked,
          hasPassword: !!user?.password,
        });

        if (!user) {
          console.log("[authorize] FAIL: user not found");
          return null;
        }
        if (user.blocked) {
          console.log("[authorize] FAIL: user blocked");
          return null;
        }
        if (!user.password) {
          console.log("[authorize] FAIL: user has no password hash");
          return null;
        }

        const ok = await bcrypt.compare(password, user.password);
        console.log("[authorize] bcrypt.compare:", ok);

        if (!ok) {
          console.log("[authorize] FAIL: wrong password");
          return null;
        }

        const roleType = user.users_role_lnk?.[0]?.roles?.name ?? null;
        const role = parseRole(roleType);

        console.log("[authorize] SUCCESS, role =", role);

        return {
          id: String(user.id),
          uuid: user.uuid,
          name: user.username ?? "",
          email: user.email ?? "",
          username: user.username ?? "",
          full_name: user.full_name ?? "",
          phone: user.phone ?? "",
          bio: user.bio ?? null,
          avatar_url: user.avatar_url ?? null,
          roleType,
          role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      const t = token as unknown as {
        id?: number;
        uuid?: string;
        username?: string;
        full_name?: string;
        phone?: string;
        bio?: string | null;
        avatar_url?: string | null;
        roleType?: string | null;
        role?: UserRole | null;
      };

      if (user) {
        const u = user as unknown as {
          id: string;
          uuid?: string;
          username?: string;
          full_name?: string;
          phone?: string;
          bio?: string | null;
          avatar_url?: string | null;
          roleType?: string | null;
          role?: UserRole | null;
        };

        t.id = Number(u.id);
        t.uuid = u.uuid;
        t.username = u.username;
        t.full_name = u.full_name;
        t.phone = u.phone;
        t.bio = u.bio;
        t.avatar_url = u.avatar_url;
        t.roleType = u.roleType;
        t.role = u.role;

        console.log("[jwt] user set into token, token.id =", t.id);
      }

      return token;
    },

    async session({ session, token }) {
      const t = token as unknown as {
        id?: number;
        uuid?: string;
        username?: string;
        full_name?: string;
        phone?: string;
        bio?: string | null;
        avatar_url?: string | null;
        roleType?: string | null;
        role?: UserRole | null;
      };

      if (!t.id) {
        console.log("[session] no token.id → anonymous");
        return session;
      }

      session.user = {
        ...session.user,
        id: t.id,
        uuid: t.uuid ?? "",
        username: t.username ?? "",
        full_name: t.full_name,
        phone: t.phone,
        bio: t.bio,
        avatar_url: t.avatar_url,
        roleType: t.roleType ?? null,
        role: t.role ?? null,
      } as typeof session.user;

      console.log("[session] session.user.id =", t.id);

      return session;
    },
  },
});

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await auth();
    console.log(
      "[getCurrentUser] session.user =",
      session?.user ? { id: (session.user as { id?: number }).id } : null,
    );

    const u = session?.user;
    if (!u || !u.id) return null;

    const dbUser = await prisma.users.findUnique({
      where: { id: u.id },
      include: {
        users_role_lnk: { include: { roles: true } },
      },
    });

    if (!dbUser) {
      console.log("[getCurrentUser] dbUser not found for id =", u.id);
      return null;
    }
    if (dbUser.blocked) {
      console.log("[getCurrentUser] dbUser blocked");
      return null;
    }

    const roleType = dbUser.users_role_lnk?.[0]?.roles?.name ?? null;
    const role = parseRole(roleType);

    return {
      id: dbUser.id,
      uuid: dbUser.uuid,
      username: dbUser.username ?? "",
      email: dbUser.email ?? "",
      full_name: dbUser.full_name || undefined,
      phone: dbUser.phone || undefined,
      avatar_url: dbUser.avatar_url ?? null,
      bio: dbUser.bio ?? null,
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
