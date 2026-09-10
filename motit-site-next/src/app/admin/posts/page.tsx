// src/app/admin/posts/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { Plus, Edit } from "lucide-react";
import { DeletePostButton } from "./DeletePostButton";
import { StatusToggleButton } from "./StatusToggleButton";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

async function getPosts() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("strapi_jwt")?.value || cookieStore.get("token")?.value;

  const res = await fetch(
    `${STRAPI_URL}/api/posts?populate[]=categories&populate[]=featured_image&sort[]=publishedAt:desc&pagination[pageSize]=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Посты</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Создать пост
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">Постов пока нет.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Заголовок
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Статус
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post: any) => {
                const postId = post.documentId || String(post.id);
                const slug = post.slug || postId;
                const status =
                  post.post_status ||
                  (post.publishedAt ? "published" : "draft");

                return (
                  <tr
                    key={postId}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {post.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {slug}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/posts/${postId}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <StatusToggleButton
                          postId={postId}
                          currentStatus={status}
                        />
                        <DeletePostButton
                          postId={postId}
                          postTitle={post.title}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
