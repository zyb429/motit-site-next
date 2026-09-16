// src/app/admin/posts/[id]/page.tsx
import { redirect } from "next/navigation";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/posts/new?id=${id}`);
}
