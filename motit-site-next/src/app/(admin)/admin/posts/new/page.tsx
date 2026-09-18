// src/app/(admin)/admin/posts/new/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CreatePostClient from "./CreatePostClient";

export type User = {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  full_name?: string;
};

export type Category = {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
};

async function getCategories(): Promise<Category[]> {
  const rows = await prisma.categories.findMany({ orderBy: { name: "asc" } });
  return rows.map((c) => ({
    id: c.id,
    documentId: c.document_id ?? undefined,
    name: c.name ?? "",
    slug: c.slug ?? "",
    description: c.description ?? null,
    icon: c.icon ?? null,
  }));
}

export default async function CreatePostPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const user: User = {
    id: currentUser.id,
    documentId: undefined,
    username: currentUser.username,
    email: currentUser.email,
    firstname: currentUser.username,
    lastname: "",
    full_name: currentUser.full_name ?? currentUser.username,
  };

  const categories = await getCategories();

  return (
    <CreatePostClient initialUser={user} initialCategories={categories} />
  );
}
