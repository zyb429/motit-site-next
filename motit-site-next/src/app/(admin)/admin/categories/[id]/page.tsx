// src/app/(admin)/admin/categories/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryEditForm from "./CategoryEditForm";

async function getCategory(rawId: string) {
  // поддержка числового id и documentId
  const num = Number(rawId);
  if (Number.isFinite(num) && num > 0) {
    const byId = await prisma.categories.findUnique({ where: { id: num } });
    if (byId) return byId;
  }
  const byDoc = await prisma.categories.findFirst({
    where: { document_id: rawId },
  });
  return byDoc;
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) notFound();

  return (
    <CategoryEditForm
      initialCategory={{
        id: category.id,
        document_id: category.document_id,
        name: category.name ?? "",
        slug: category.slug ?? "",
        description: category.description ?? "",
        icon: category.icon ?? "",
      }}
    />
  );
}
