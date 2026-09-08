"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CustomElement } from "@/types/slate";

const SlateEditor = dynamic(() => import("@/components/editor/SlateEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-75 border rounded-lg p-4 flex items-center justify-center text-gray-500">
      Загрузка редактора...
    </div>
  ),
});

type Category = {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

type User = {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  firstname?: string;
};

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<CustomElement[] | null>(null);
  const [excerpt, setExcerpt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          let categories = [];
          if (catData.data && Array.isArray(catData.data)) {
            categories = catData.data;
          } else if (Array.isArray(catData)) {
            categories = catData;
          }
          setCategories(categories);
        }

        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.user || userData.data);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Ошибка:", error);
      }
    };
    fetchData();
  }, [router]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Введите заголовок");
      return;
    }

    if (!content || content.length === 0) {
      alert("Введите содержание поста");
      return;
    }

    const hasContent = content.some(
      (node) =>
        node.children &&
        node.children.some((child) => child.text.trim() !== ""),
    );
    if (!hasContent) {
      alert("Введите содержание поста");
      return;
    }

    if (!currentUser) {
      alert("Пользователь не авторизован");
      return;
    }

    setIsLoading(true);

    try {
      const baseSlug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const slug = `${baseSlug}-${Date.now()}`;

      // ✅ СОЗДАЕМ ПОСТ БЕЗ КАТЕГОРИЙ
      const postData: any = {
        data: {
          title: title.trim(),
          slug: slug,
          content: JSON.stringify(content),
          excerpt: excerpt.trim(),
          post_status: "published",
          publishedAt: new Date().toISOString(),
        },
      };

      console.log("📝 Отправка:", JSON.stringify(postData, null, 2));

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      const result = await res.json();
      console.log("📥 Ответ:", result);

      if (res.ok) {
        // ✅ ДОБАВЛЯЕМ КАТЕГОРИЮ ЧЕРЕЗ PUT
        if (selectedCategory) {
          const postId = result.data?.id || result.data?.attributes?.id;
          if (postId) {
            try {
              await fetch(`/api/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  data: {
                    categories: [selectedCategory],
                  },
                }),
              });
              console.log("✅ Категория добавлена");
            } catch (err) {
              console.warn("⚠️ Категория не добавлена");
            }
          }
        }

        alert("✅ Пост успешно создан!");
        const slug = result.data?.attributes?.slug || result.data?.slug;
        if (slug) {
          router.push(`/blog/${slug}`);
        } else {
          router.push("/admin/posts");
        }
      } else {
        alert(`Ошибка: ${result.error?.message || "Не удалось создать пост"}`);
      }
    } catch (error) {
      console.error("❌ Ошибка:", error);
      alert("Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !isMounted || isLoading || !currentUser;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Создать пост</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Заголовок
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isDisabled}
            suppressHydrationWarning
            placeholder="Введите заголовок..."
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
            Краткое описание
          </label>
          <input
            id="excerpt"
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={300}
            disabled={isDisabled}
            suppressHydrationWarning
            placeholder="Краткое описание поста..."
          />
          <p className="text-sm text-gray-500 mt-1">
            {excerpt.length}/300 символов
          </p>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Категория
          </label>
          <select
            id="category"
            value={selectedCategory || ""}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value ? Number(e.target.value) : null,
              )
            }
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isDisabled}
            suppressHydrationWarning
          >
            <option value="">Без категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Содержание</label>
          <SlateEditor onChange={setContent} />
        </div>

        {isMounted && currentUser && (
          <div className="text-sm text-gray-400">
            Автор: {currentUser.firstname || currentUser.username}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isDisabled}
            suppressHydrationWarning
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Публикация..." : "Опубликовать"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/posts")}
            disabled={isDisabled}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
