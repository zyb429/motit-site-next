// app/admin/posts/new/CreatePostClient.tsx
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
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  X,
  Loader2,
  FileText,
  Tag,
  AlignLeft,
} from "lucide-react";
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
  full_name?: string;
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

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [categories]);

  const isDisabled = isPending || isSubmitting;

  if (!isClient || isLoading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-medium">Доступ запрещен</p>
          <p className="text-sm mt-1">
            Пожалуйста,{" "}
            <Link href="/login" className="underline hover:text-red-800">
              войдите
            </Link>{" "}
            для создания поста
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Создать пост
                  </h1>
                  <p className="text-sm text-gray-500">
                    Автор: {user.full_name || user.firstname || user.username}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isDisabled}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Отмена</span>
              </button>
              <button
                type="submit"
                form="post-form"
                disabled={isDisabled}
                className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm hover:shadow"
              >
                {isPending || isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Публикация...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Опубликовать</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <form
          id="post-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Заголовок */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Основная информация
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Заголовок <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  {...register("title")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                  disabled={isDisabled}
                  placeholder="Введите заголовок поста..."
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="excerpt"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Краткое описание
                </label>
                <input
                  id="excerpt"
                  type="text"
                  {...register("excerpt")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isDisabled}
                  placeholder="Краткое описание поста (до 300 символов)..."
                  maxLength={300}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {excerptValue.length}/300 символов
                </p>
              </div>
            </div>
          </div>

          {/* Категория */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Категория</h2>
            </div>

            <select
              id="category"
              {...register("categoryId", { valueAsNumber: true })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlignLeft className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Содержание <span className="text-red-500">*</span>
              </h2>
            </div>

            <SlateEditor onChange={setContent} readOnly={isDisabled} />
            {errors.content && (
              <p className="text-red-500 text-sm mt-2">
                {errors.content.message}
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
});
