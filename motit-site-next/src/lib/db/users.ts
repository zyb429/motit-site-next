import { prisma } from "@/lib/prisma";

export type UserItem = {
  id: number;
  username: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  blocked: boolean;
  role: { id: number; name: string; type: string } | null;
};

export async function getUsersPrisma(): Promise<UserItem[]> {
  const rows = await prisma.users.findMany({
    orderBy: { created_at: "desc" },
    include: { users_role_lnk: { include: { up_roles: true } } },
  });

  return rows.map((u) => {
    const role = u.users_role_lnk?.[0]?.up_roles ?? null;
    return {
      id: u.id,
      username: u.username ?? "",
      email: u.email ?? null,
      full_name: u.full_name ?? null,
      phone: u.phone ?? null,
      blocked: u.blocked ?? false,
      role: role
        ? { id: role.id, name: role.name ?? "", type: role.type ?? "" }
        : null,
    };
  });
}

export async function getRolesPrisma() {
  const rows = await prisma.up_roles.findMany({ orderBy: { name: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name ?? "",
    type: r.type ?? "",
    description: r.description ?? null,
  }));
}
