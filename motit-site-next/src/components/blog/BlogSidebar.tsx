// src/components/blog/BlogSidebar.tsx
import Link from "next/link";
import { Calendar } from "lucide-react";
import { getPostsPrisma } from "@/lib/db/posts";
import { getSiteSettings } from "@/lib/db/site-settings";
import { formatDate } from "@/lib/format-date";

export async function BlogSidebar() {
  const posts = await getPostsPrisma({ status: "published", take: 4 });
  const validPosts = posts.filter((p) => p.title?.trim());

  if (validPosts.length === 0) return null;

  const settings = await getSiteSettings();
  const tz = settings?.timezone ?? "Europe/Minsk";
  const locale = (settings?.siteLocale ?? "ru") as "ru" | "en" | "be";
  const dateOpts = {
    day: "numeric" as const,
    month: "short" as const,
    year: "numeric" as const,
  };

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <h4 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3">
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
                  className="group flex gap-3 items-start hover:bg-(--bg-card-hover) p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-(--bg-primary)">
                    <div className="w-full h-full flex items-center justify-center text-(--text-muted) text-lg">
                      📄
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-(--text-secondary) group-hover:text-(--accent) transition-colors line-clamp-2">
                      {title}
                    </h5>
                    {post.publishedAt && (
                      <span className="text-xs text-(--text-muted) flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(post.publishedAt, tz, locale, dateOpts)}
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