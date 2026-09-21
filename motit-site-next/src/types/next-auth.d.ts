// src/types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from "next-auth";
import type { UserRole } from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      uuid: string;
      username: string;
      full_name?: string;
      phone?: string;
      bio?: string | null;
      avatar_url?: string | null;
      roleType: string | null;
      role: UserRole | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    uuid: string;
    username: string;
    full_name?: string;
    phone?: string;
    bio?: string | null;
    avatar_url?: string | null;
    roleType: string | null;
    role: UserRole | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    uuid: string;
    username: string;
    full_name?: string;
    phone?: string;
    bio?: string | null;
    avatar_url?: string | null;
    roleType: string | null;
    role: UserRole | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: number;
    uuid: string;
    username: string;
    full_name?: string;
    phone?: string;
    bio?: string | null;
    avatar_url?: string | null;
    roleType: string | null;
    role: UserRole | null;
  }
}

export {};
