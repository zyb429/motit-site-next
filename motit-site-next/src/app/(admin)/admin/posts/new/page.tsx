import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPostAccess } from "@/lib/posts/access";
import CollaboratorsSection from "./collaborators/CollaboratorsSection";
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
  const rows = await prisma.categories.findMany({
    orderBy: { name: "asc" },
  });

  return rows.map((c) => ({
    id: c.id,
    documentId: c.document_id ?? undefined,
    name: c.name ?? "",
    slug: c.slug ?? "",
    description: c.description ?? null,
    icon: c.icon ?? null,
  }));
}

export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const params = await searchParams;
  const editId = params.id ?? null;

  const access = editId ? await getPostAccess(editId) : null;

  if (editId && (!access || !access.canView)) {
    redirect("/admin/posts");
  }

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
    <CreatePostClient
      initialUser={user}
      initialCategories={categories}
      canEdit={access ? access.canEdit : true}
      postAuthor={access?.author ?? null}
    >
      {editId && access?.canView ? (
        <CollaboratorsSection postId={editId as string} />
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Соавторы
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Соавторов можно добавить после первого сохранения поста.
          </p>
        </div>
      )}
    </CreatePostClient>
  );
}