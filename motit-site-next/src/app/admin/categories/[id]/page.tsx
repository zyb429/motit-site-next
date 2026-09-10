import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CategoryEditForm from "./CategoryEditForm";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

async function getCategory(id: string) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

  const res = await fetch(`${STRAPI_URL}/api/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) notFound();

  return <CategoryEditForm initialCategory={category} />;
}
