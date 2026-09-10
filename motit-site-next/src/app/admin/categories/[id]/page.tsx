// src/app/admin/categories/[id]/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-6 py-8">
      <Link
        href="/admin/categories"
        className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к категориям
      </Link>
      <h1 className="text-2xl font-bold mb-4">Редактирование категории</h1>
      <p className="text-gray-500">
        ID категории: <span className="font-mono">{id}</span>
      </p>
    </div>
  );
}
