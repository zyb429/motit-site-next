"use client";

import {
  useState,
  useEffect,
  useTransition,
  memo,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamic from "next/dynamic";
import type { CustomElement } from "@/types/slate";

// ✅ Импортируем скелетоны
import { EditorSkeleton } from "@/components/editor/EditorSkeleton";
import { PageSkeleton } from "@/components/PageSkeleton";

// ✅ Импортируем утилиты
import { generateSlug } from "@/lib/utils";

// ✅ Определяем типы
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
  lastname?: string;
};

// Схема валидации
const postSchema = z.object({
  title: z
    .string()
    .min(1, "Заголовок обязателен")
    .max(200, "Максимум 200 символов"),
  excerpt: z.string().max(300, "Максимум 300 символов").optional(),
  categoryId: z.number().nullable(),
  content: z.string().min(1, "Содержание обязательно"),
});

type PostFormData = z.infer<typeof postSchema>;
type CreatePostProps = {
  initialUser: User | null;
  initialCategories: Category[];
};

// Динамический импорт редактора
const SlateEditor = dynamic(() => import("@/components/editor/SlateEditor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

export default memo(function CreatePostClient({
  initialUser,
  initialCategories,
}: CreatePostProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState<CustomElement[] | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      categoryId: null,
      content: "",
    },
  });

  const excerptValue = watch("excerpt") || "";

  useEffect(() => {
    const fetchData = async () => {
      if (!initialUser) {
        setIsLoading(true);
        try {
          const userRes = await fetch("/api/auth/me");
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData.user || userData.data || null);
          }
          // Загружаем категории
          if (initialCategories.length === 0) {
            const catRes = await fetch("/api/categories");
            if (catRes.ok) {
              const catData = await catRes.json();
              setCategories(catData.data || catData || []);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [initialUser, initialCategories]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (content) {
      setValue("content", JSON.stringify(content));
    }
  }, [content, setValue]);

  const onSubmit = useCallback(
    async (data: PostFormData) => {
      if (!user) {
        alert("Пользователь не авторизован!");
        return;
      }

      startTransition(async () => {
        try {
          const response = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: {
                title: data.title,
                slug: generateSlug(data.title),
                content: data.content,
                excerpt: data.excerpt || "",
                category: data.categoryId,
                author: user.id,
                publishedAt: new Date().toISOString(),
              },
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create post");
          }

          const result = await response.json();
          router.push(`/blog/${result.data.slug}`);
          router.refresh();
        } catch (error) {
          console.error("Error creating post:", error);
          alert(error instanceof Error ? error.message : "Произошла ошибка");
        }
      });
    },
    [user, router],
  );

  // ✅ Мемоизация опций категорий
  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [categories]);

  const isDisabled = isPending || isSubmitting;

  // ✅ Предотвращаем гидратацию
  if (!isClient || isLoading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>
            Пожалуйста,{" "}
            <a href="/login" className="underline">
              войдите
            </a>{" "}
            для создания поста
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Заголовок */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Заголовок <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isDisabled}
          placeholder="Введите заголовок..."
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Краткое описание */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
          Краткое описание
        </label>
        <input
          id="excerpt"
          type="text"
          {...register("excerpt")}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isDisabled}
          placeholder="Краткое описание поста..."
          maxLength={300}
        />
        <p className="text-sm text-gray-500 mt-1">
          {excerptValue.length}/300 символов
        </p>
      </div>

      {/* Категория */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Категория
        </label>
        <select
          id="category"
          {...register("categoryId", { valueAsNumber: true })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isDisabled}
        >
          <option value="">Без категории</option>
          {categoryOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Содержание */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Содержание <span className="text-red-500">*</span>
        </label>
        <SlateEditor onChange={setContent} readOnly={isDisabled} />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      {/* Информация об авторе */}
      {isClient && initialUser && (
        <div className="text-sm text-gray-500">
          Автор: {initialUser.firstname || initialUser.username}
        </div>
      )}

      {/* Кнопки */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isDisabled}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending || isSubmitting ? "Публикация..." : "Опубликовать"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isDisabled}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
});
