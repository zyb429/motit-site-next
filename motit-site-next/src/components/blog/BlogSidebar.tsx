// src/components/blog/BlogSidebar.tsx
import Link from "next/link";
import { Calendar } from "lucide-react";
import { getPostsPrisma } from "@/lib/db/posts";

export async function BlogSidebar() {
  const posts = await getPostsPrisma({ status: "published", take: 4 });
  const validPosts = posts.filter((p) => p.title?.trim());

  if (validPosts.length === 0) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Свежие статьи
        </h4>
        <ul className="space-y-3">
          {validPosts.map((post) => {
            const title = post.title || "Без названия";
            const slug = post.slug || String(post.id);

            return (
              <li key={post.id}>
                <Link
                  href={`/blog/${slug}`}
                  className="group flex gap-3 items-start hover:bg-[#0d2029] p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-[#0a1920]">
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg">
                      📄
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-gray-300 group-hover:text-[#2dd4bf] transition-colors line-clamp-2">
                      {title}
                    </h5>
                    {post.publishedAt && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
