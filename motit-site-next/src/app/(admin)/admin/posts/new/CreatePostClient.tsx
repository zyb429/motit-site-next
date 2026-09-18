// app/admin/posts/new/CreatePostClient.tsx
"use client";

import {
  useState,
  useEffect,
  useTransition,
  memo,
  useCallback,
  useMemo,
  useRef,
  type ChangeEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Image as ImageIcon,
  Upload,
  Trash2,
  PlusCircle,
} from "lucide-react";
import type { CustomElement } from "@/types/slate";

import { EditorSkeleton } from "@/components/editor/EditorSkeleton";
import { PageSkeleton } from "@/components/PageSkeleton";
import { generateSlug } from "@/lib/utils";

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

const SlateEditor = dynamic(() => import("@/components/editor/SlateEditor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

// Общие классы для инпутов / селектов / textarea
const inputClass =
  "w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors";

const cardClass =
  "bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border)] p-6";

const cardHeaderClass =
  "flex items-center gap-2 mb-4 text-[var(--text-primary)]";

export default memo(function CreatePostClient({
  initialUser,
  initialCategories,
}: CreatePostProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);

  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState<CustomElement[] | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(isEditMode);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<
    string | null
  >(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!isEditMode || !editId) return;

    const loadPost = async () => {
      try {
        const res = await fetch(
          `/api/posts/${editId}?populate[]=categories&populate[]=featured_image`,
        );
        if (!res.ok) throw new Error("Не удалось загрузить пост");

        const json = await res.json();
        const post = json.data || json;

        setValue("title", post.title || "");
        setValue("excerpt", post.excerpt || "");
        setValue("categoryId", post.categories?.[0]?.id ?? null);

        if (post.content) {
          try {
            const raw =
              typeof post.content === "string"
                ? JSON.parse(post.content)
                : post.content;
            const parsed: CustomElement[] = Array.isArray(raw) ? raw : [raw];
            setContent(parsed);
            setValue("content", JSON.stringify(parsed));
          } catch {
            setValue("content", post.content);
          }
        }

        if (post.featured_image?.url) {
          setFeaturedImagePreview(post.featured_image.url);
        }
      } catch (err) {
        console.error("❌ Load post error:", err);
        alert("Не удалось загрузить пост");
      } finally {
        setIsLoadingPost(false);
      }
    };

    loadPost();
  }, [isEditMode, editId, setValue]);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите изображение");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Файл слишком большой (максимум 5MB)");
      return;
    }
    setFeaturedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFeaturedImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFeaturedImage(null);
    setFeaturedImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (): Promise<number | null> => {
    if (!featuredImage) return null;
    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("files", featuredImage);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      const file = Array.isArray(data) ? data[0] : data?.data?.[0];
      return file?.id ?? null;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = useCallback(
    async (data: PostFormData) => {
      if (!user) {
        alert("Пользователь не авторизован!");
        return;
      }

      startTransition(async () => {
        try {
          let featuredImageId: number | null = null;
          if (featuredImage) {
            featuredImageId = await uploadImage();
          }

          const categoryId = Number.isFinite(data.categoryId)
            ? data.categoryId
            : null;

          const categoryDocId = categoryId
            ? categories.find((c) => c.id === categoryId)?.documentId
            : null;

          const generatedSlug = generateSlug(data.title);
          const slug = generatedSlug || `post-${Date.now()}`;

          const payload: any = {
            title: data.title,
            slug,
            content:
              typeof data.content === "string"
                ? (() => {
                  try {
                    return JSON.parse(data.content);
                  } catch {
                    return data.content;
                  }
                })()
                : data.content,
            excerpt: data.excerpt || "",
          };

          if (categoryDocId) {
            payload.categories = [categoryDocId];
          }

          if (featuredImageId) {
            payload.featured_image = featuredImageId;
          }

          let response: Response;

          if (isEditMode && editId) {
            response = await fetch(`/api/posts/${editId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data: payload }),
            });
          } else {
            response = await fetch("/api/posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                data: {
                  ...payload,
                  author: user.documentId,
                },
              }),
            });
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
              error.error?.message ||
              error.error ||
              (isEditMode ? "Ошибка обновления" : "Ошибка создания"),
            );
          }

          const result = await response.json();
          const resultSlug = result?.data?.slug || slug;
          if (resultSlug) {
            router.push(`/blog/${resultSlug}`);
            router.refresh();
          } else {
            router.push("/admin/posts");
            router.refresh();
          }
        } catch (error) {
          console.error(
            isEditMode ? "❌ Update error:" : "❌ Create error:",
            error,
          );
          alert(error instanceof Error ? error.message : "Произошла ошибка");
        }
      });
    },
    [user, router, featuredImage, isEditMode, editId, categories],
  );

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [categories]);

  const isDisabled = isPending || isSubmitting || isUploadingImage;

  if (!isClient || isLoading || (isEditMode && isLoadingPost)) {
    return <PageSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-primary)">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-lg max-w-md">
          <p className="font-medium">Доступ запрещен</p>
          <p className="text-sm mt-1">
            Пожалуйста,{" "}
            <Link href="/login" className="underline hover:text-red-300">
              войдите
            </Link>{" "}
            {isEditMode ? "для редактирования" : "для создания"} поста
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-primary)">
      <header className="bg-(--bg-card) border-b border-(--border) sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-(--text-muted) hover:text-(--text-primary) transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-(--accent-dim) rounded-lg flex items-center justify-center">
                  <PlusCircle className="w-6 h-6 text-(--accent)" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-(--text-primary)">
                    {isEditMode ? "Редактировать пост" : "Создать пост"}
                  </h1>
                  <p className="text-sm text-(--text-secondary)">
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
                className="px-4 py-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Отмена</span>
              </button>
              <button
                type="submit"
                form="post-form"
                disabled={isDisabled}
                className="px-6 py-2 bg-(--accent) text-(--bg-primary) rounded-lg hover:bg-(--accent-hover) disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm hover:shadow font-medium"
              >
                {isPending || isSubmitting || isUploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {isUploadingImage
                        ? "Загрузка..."
                        : isEditMode
                          ? "Сохранение..."
                          : "Публикация..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditMode ? "Сохранить" : "Опубликовать"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <form
          id="post-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Заголовок */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <FileText className="w-5 h-5 text-(--accent)" />
              <h2 className="text-lg font-semibold">Основная информация</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-(--text-primary) mb-1"
                >
                  Заголовок <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  {...register("title")}
                  className={`${inputClass} ${errors.title ? "border-red-500" : ""
                    }`}
                  disabled={isDisabled}
                  placeholder="Введите заголовок поста..."
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="excerpt"
                  className="block text-sm font-medium text-(--text-primary) mb-1"
                >
                  Краткое описание
                </label>
                <input
                  id="excerpt"
                  type="text"
                  {...register("excerpt")}
                  className={inputClass}
                  disabled={isDisabled}
                  placeholder="Краткое описание поста (до 300 символов)..."
                  maxLength={300}
                />
                <p className="text-sm text-(--text-muted) mt-1">
                  {excerptValue.length}/300 символов
                </p>
              </div>
            </div>
          </div>

          {/* Превью */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <ImageIcon className="w-5 h-5 text-(--accent)" />
              <h2 className="text-lg font-semibold">Превью поста</h2>
            </div>

            <div className="space-y-4">
              {featuredImagePreview ? (
                <div className="relative">
                  <img
                    src={featuredImagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-(--border)"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isDisabled}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-(--border) rounded-lg p-8 text-center cursor-pointer hover:border-(--accent) hover:bg-(--accent-dim) transition-colors"
                >
                  <Upload className="w-12 h-12 text-(--text-muted) mx-auto mb-2" />
                  <p className="text-(--text-primary) font-medium">
                    Нажмите для загрузки изображения
                  </p>
                  <p className="text-sm text-(--text-muted) mt-1">
                    PNG, JPG, WEBP до 5MB
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* Категория */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <Tag className="w-5 h-5 text-(--accent)" />
              <h2 className="text-lg font-semibold">Категория</h2>
            </div>

            <select
              id="category"
              {...register("categoryId", { valueAsNumber: true })}
              className={inputClass}
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
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <AlignLeft className="w-5 h-5 text-(--accent)" />
              <h2 className="text-lg font-semibold">
                Содержание <span className="text-red-500">*</span>
              </h2>
            </div>

            <SlateEditor
              initialValue={content}
              onChange={setContent}
              readOnly={isDisabled}
            />
            {errors.content && (
              <p className="text-red-400 text-sm mt-2">
                {errors.content.message}
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
});
