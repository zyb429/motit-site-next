// src/app/(admin)/admin/posts/new/CreatePostClient.tsx
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
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  X,
  Loader2,
  FileText,
  Tag,
  Image as ImageIcon,
  Upload,
  Trash2,
  Settings2,
} from "lucide-react";
import { openEditorModal } from "@rageshpikalmunde/rp-image-editor";

import type { CustomElement } from "@/types/slate";
import { PageSkeleton } from "@/components/PageSkeleton";
import { generateSlug } from "@/lib/utils";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

type Category = {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  firstname?: string;
  full_name?: string;
};

const postSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен").max(200, "Максимум 200 символов"),
  excerpt: z.string().max(300, "Максимум 300 символов").optional(),
  categoryId: z.number().nullable(),
  content: z.string().optional(),
  post_status: z.enum(["draft", "published"]).default("published"),
});

type PostFormInput = z.input<typeof postSchema>;
type PostFormData = z.output<typeof postSchema>;

type CreatePostProps = {
  initialUser: User | null;
  initialCategories: Category[];
};

const inputClass =
  "w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors text-sm";

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
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditingCover, setIsEditingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormInput, any, PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      categoryId: null,
      content: "",
      post_status: "published",
    },
  });

  const titleValue = watch("title");
  const excerptValue = watch("excerpt") || "";
  const postStatusValue = watch("post_status");
  const categoryValue = watch("categoryId");

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
    if (!isEditMode || !editId) return;

    const loadPost = async () => {
      try {
        const res = await fetch(
          `/api/posts/${editId}?populate[]=categories&populate[]=featured_image`
        );
        if (!res.ok) throw new Error("Не удалось загрузить пост");

        const json = await res.json();
        const post = json.data || json;

        setValue("title", post.title || "");
        setValue("excerpt", post.excerpt || "");
        setValue("categoryId", post.categories?.[0]?.id ?? null);
        setValue(
          "post_status",
          post.post_status === "draft" ? "draft" : "published"
        );

        if (post.content) {
          try {
            const raw =
              typeof post.content === "string"
                ? JSON.parse(post.content)
                : post.content;
            if (
              raw &&
              typeof raw === "object" &&
              !Array.isArray(raw) &&
              raw.type === "doc"
            ) {
              setContent(raw);
              setValue("content", JSON.stringify(raw));
            } else {
              setContent(null);
              setValue("content", "");
            }
          } catch {
            setContent(null);
            setValue("content", "");
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Открывает тот же редактор, что используется в ImageNode (в теле поста)
  const handleEditCover = async () => {
    if (!featuredImagePreview || isEditingCover) return;
    try {
      setIsEditingCover(true);

      // 1. Загружаем текущее изображение как File
      const res = await fetch(featuredImagePreview);
      if (!res.ok) throw new Error("Не удалось загрузить изображение");
      const blob = await res.blob();
      const file = new File([blob], "cover.jpg", {
        type: blob.type || "image/jpeg",
      });

      // 2. Открываем модал редактора
      const result = await openEditorModal({
        image: file,
        config: {
          exportFormat: "jpeg",
          exportQuality: 0.92,
          maxUndoSteps: 30,
          language: "en",
        },
      });

      if (!result?.file) return;

      // 3. Мгновенное превью (blob URL) — не ждём загрузки на сервер
      const newPreviewUrl = URL.createObjectURL(result.file);
      setFeaturedImagePreview(newPreviewUrl);

      // 4. Сохраняем File для последующей загрузки на сервер при submit
      setFeaturedImage(result.file);
    } catch (err) {
      console.error("Cover edit error:", err);
      alert(err instanceof Error ? err.message : "Не удалось отредактировать");
    } finally {
      setIsEditingCover(false);
    }
  };

  const uploadImage = useCallback(async (): Promise<number | null> => {
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
  }, [featuredImage]);

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

          const safeContent = (() => {
            const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
            if (!data.content || data.content.trim() === "") return emptyDoc;
            try {
              const parsed = JSON.parse(data.content);
              if (Array.isArray(parsed)) return emptyDoc;
              return parsed;
            } catch {
              return emptyDoc;
            }
          })();

          const payload: any = {
            title: data.title,
            slug,
            content: safeContent,
            excerpt: data.excerpt || "",
            post_status: data.post_status ?? "published",
          };

          if (categoryDocId) payload.categories = [categoryDocId];
          if (featuredImageId) payload.featured_image = featuredImageId;

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
              body: JSON.stringify({ data: payload }),
            });
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
              error.error?.message ||
                error.error ||
                (isEditMode ? "Ошибка обновления" : "Ошибка создания")
            );
          }

          const result = await response.json();
          const resultSlug = result?.data?.slug || slug;
          const resultStatus = result.data?.post_status || data.post_status;

          if (resultStatus === "draft") {
            router.push("/admin/posts");
          } else if (resultSlug) {
            router.push(`/blog/${resultSlug}`);
          } else {
            router.push("/admin/posts");
          }
          router.refresh();
        } catch (error) {
          console.error("❌ Error:", error);
          alert(error instanceof Error ? error.message : "Произошла ошибка");
        }
      });
    },
    [user, router, featuredImage, isEditMode, editId, categories, uploadImage]
  );

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({ value: cat.id, label: cat.name }));
  }, [categories]);

  const isDisabled = isPending || isSubmitting || isUploadingImage || isEditingCover;

  if (!isClient || isLoading || (isEditMode && isLoadingPost)) {
    return <PageSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center bg-[var(--bg-primary)] p-4">
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
    <div className="flex flex-col h-screen bg-[var(--bg-primary)] overflow-hidden font-sans">
      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-full hover:bg-[var(--bg-secondary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">
              {isEditMode ? "Редактирование поста" : "Новый пост"}
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              {postStatusValue === "draft" ? "Черновик" : "Публикация"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isDisabled}
            className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            form="post-form"
            disabled={isDisabled}
            className="px-5 py-2 bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm font-medium text-sm"
          >
            {isPending || isSubmitting || isUploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Сохранение...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>
                  {postStatusValue === "draft"
                    ? "Сохранить черновик"
                    : "Опубликовать"}
                </span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ОСНОВНАЯ ОБЛАСТЬ */}
      <main className="flex-1 flex overflow-hidden">
        <form
          id="post-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex overflow-hidden"
        >
          {/* ЛЕВАЯ КОЛОНКА: РЕДАКТОР */}
          <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)] overflow-y-auto">
            <div className="w-full px-8 py-10 flex flex-col gap-6 min-h-full">
              {/* Заголовок */}
              <input
                id="title"
                type="text"
                {...register("title")}
                disabled={isDisabled}
                placeholder="Заголовок поста..."
                className="w-full bg-[#0b1f26] text-4xl font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none border border-[#1b3a44] rounded-xl px-6 py-4 focus:border-[var(--accent)] transition-colors"
              />
              {errors.title && (
                <p className="text-red-400 text-sm -mt-4">
                  {errors.title.message}
                </p>
              )}

              {/* Редактор */}
              <div 
                className="flex-1 flex flex-col relative overflow-hidden rounded-xl border border-[var(--border)] transition-colors focus-within:border-[var(--accent)] bg-[var(--bg-primary)]"
                style={{ outline: "none", boxShadow: "none" }}
              >
                <SimpleEditor
                  initialContent={content}
                  onChange={(json) =>
                    setValue("content", JSON.stringify(json))
                  }
                  editable={!isDisabled}
                />
              </div>
              
              {errors.content && (
                <p className="text-red-400 text-sm">
                  {errors.content.message}
                </p>
              )}
            </div> {/* Закрывает div с классом w-full px-8 py-10 */}
          </div> {/* Закрывает левую колонку flex-1 */}

          {/* ПРАВАЯ КОЛОНКА: НАСТРОЙКИ */}
          <aside className="w-80 shrink-0 border-l border-[var(--border)] bg-[var(--bg-card)] flex flex-col relative z-10">
            <div className="p-5 border-b border-[var(--border)] flex items-center gap-2 text-[var(--text-primary)] font-medium shrink-0">
              <Settings2 className="w-4 h-4" />
              <span>Настройки поста</span>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-visible">
              <div className="p-5 space-y-6">
                {/* Статус публикации */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Публикация
                  </label>
                  <select
                    id="post_status"
                    {...register("post_status")}
                    className={inputClass}
                    disabled={isDisabled}
                  >
                    <option value="published">Опубликовать</option>
                    <option value="draft">Черновик</option>
                  </select>
                </div>

                {/* Категория */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Категория
                  </label>
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

                {/* Краткое описание */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Краткое описание
                  </label>
                  <textarea
                    id="excerpt"
                    {...register("excerpt")}
                    className={`${inputClass} min-h-[100px] resize-y`}
                    disabled={isDisabled}
                    placeholder="Пара предложений о чём пост..."
                    maxLength={300}
                  />
                  <p className="text-right text-xs text-[var(--text-muted)]">
                    {excerptValue.length}/300
                  </p>
                </div>

                {/* Обложка */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Обложка
                  </label>
                  {featuredImagePreview ? (
                    <div className="relative group rounded-lg overflow-hidden border border-[var(--border)]">
                      <img
                        src={featuredImagePreview}
                        alt="Cover"
                        className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={handleEditCover}
                      />
                      {isEditingCover && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        disabled={isDisabled}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isDisabled}
                      className="w-full border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors group"
                    >
                      <Upload className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2 group-hover:text-[var(--accent)]" />
                      <p className="text-xs text-[var(--text-secondary)]">
                        Загрузить обложку
                      </p>
                    </button>
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
            </div>

            <div className="shrink-0 p-5 border-t border-[var(--border)] text-xs text-[var(--text-muted)] text-center bg-[var(--bg-card)]">
              Автор: {user.full_name || user.firstname || user.username}
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
});