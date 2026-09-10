// src/app/admin/categories/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { Plus, Edit } from "lucide-react";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

async function getCategories() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

  const res = await fetch(
    `${STRAPI_URL}/api/categories?sort[]=name:asc&pagination[pageSize]=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Категории</h1>
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Создать категорию
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-500">Категорий пока нет.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: any) => (
            <div
              key={cat.documentId || cat.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{cat.slug}</p>
                  {cat.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {cat.description}
                    </p>
                  )}
                </div>
                <Link
                  href={`/admin/categories/${cat.documentId || cat.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
