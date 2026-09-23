// src/lib/user-password.ts
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function createUserWithPassword(data: {
  uuid: string;
  username: string;
  email: string;
  password: string;
  full_name?: string;
}) {
  const password_hash = await hashPassword(data.password);
  return prisma.users.create({
    data: {
      uuid: data.uuid,
      username: data.username,
      email: data.email,
      password_hash,
      full_name: data.full_name,
      is_active: true,
      blocked: false,
    },
  });
}

export async function setUserPassword(identifier: string, plain: string) {
  const password_hash = await hashPassword(plain);
  const res = await prisma.users.updateMany({
    where: { OR: [{ username: identifier }, { email: identifier }] },
    data: { password_hash, updated_at: new Date() },
  });
  return res.count;
}
