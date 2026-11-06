// src/app/(admin)/admin/posts/new/CreatePostClient.tsx
"use client";

import {
  useState,
  useEffect,
  useTransition,
  memo,
  useCallback,
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
  Settings2,
  History,
  Send,
} from "lucide-react";

import type { CustomElement } from "@/types/slate";
import { PageSkeleton } from "@/components/PageSkeleton";
import { generateSlug } from "@/lib/utils";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { PostVersionsModal } from "@/components/admin/PostVersionsModal";
import { PostSettingsFields } from "@/components/admin/PostSettingsFields";

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
  title: z
    .string()
    .min(1, "Заголовок обязателен")
    .max(200, "Максимум 200 символов"),
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
  const [featuredImagePreview, setFeaturedImagePreview] = useState<
    string | null
  >(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditingCover, setIsEditingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
          `/api/posts/${editId}?populate[]=categories&populate[]=featured_image`,
        );
        if (!res.ok) throw new Error("Не удалось загрузить пост");

        const json = await res.json();
        const post = json.data || json;

        setValue("title", post.title || "");
        setValue("excerpt", post.excerpt || "");
        setValue("categoryId", post.categories?.[0]?.id ?? null);
        setValue(
          "post_status",
          post.post_status === "draft" ? "draft" : "published",
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
        console.error("Load post error:", err);
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

  const handleEditCover = async () => {
    if (!featuredImagePreview || isEditingCover) return;
    try {
      setIsEditingCover(true);

      const res = await fetch(featuredImagePreview);
      if (!res.ok) throw new Error("Не удалось загрузить изображение");
      const blob = await res.blob();
      const file = new File([blob], "cover.jpg", {
        type: blob.type || "image/jpeg",
      });

      const { openEditorModal } = await import(
        "@rageshpikalmunde/rp-image-editor"
      );

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

      const newPreviewUrl = URL.createObjectURL(result.file);
      setFeaturedImagePreview(newPreviewUrl);
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
                (isEditMode ? "Ошибка обновления" : "Ошибка создания"),
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
          console.error("Error:", error);
          alert(error instanceof Error ? error.message : "Произошла ошибка");
        }
      });
    },
    [user, router, featuredImage, isEditMode, editId, categories, uploadImage],
  );

  const isDisabled =
    isPending || isSubmitting || isUploadingImage || isEditingCover;

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
    <div className="flex flex-col h-dvh bg-[var(--bg-primary)] overflow-hidden font-sans">
      {/* ==================== ХЕДЕР ==================== */}
      <header className="shrink-0 flex items-center justify-between gap-1.5 sm:gap-3 px-2 sm:px-6 py-1.5 sm:py-3 border-b border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
          <Link
            href="/admin/posts"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1.5 sm:p-2 rounded-full hover:bg-[var(--bg-secondary)] shrink-0"
            aria-label="Назад к постам"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] truncate">
              {isEditMode ? "Редактирование" : "Новый пост"}
            </h1>
            <p className="text-[10px] sm:text-xs text-[var(--text-muted)] truncate">
              {postStatusValue === "draft" ? "Черновик" : "Публикация"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
          {/* Настройки — только иконка на мобилке */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            disabled={isDisabled}
            className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
            aria-label="Настройки поста"
            title="Настройки"
          >
            <Settings2 className="w-5 h-5" />
          </button>

          {/* История — только иконка на мобилке, если editMode */}
          {isEditMode && editId && (
            <button
              type="button"
              onClick={() => setVersionsOpen(true)}
              disabled={isDisabled}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
              aria-label="История версий"
              title="История"
            >
              <History className="w-5 h-5" />
            </button>
          )}

          {/* Отмена — только иконка на мобилке */}
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isDisabled}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
            aria-label="Отмена"
            title="Отмена"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Сохранить — иконка + текст на мобилке только иконка */}
          <button
            type="submit"
            form="post-form"
            disabled={isDisabled}
            aria-label={
              postStatusValue === "draft"
                ? "Сохранить черновик"
                : "Опубликовать"
            }
            className="ml-0.5 sm:ml-2 px-2.5 sm:px-5 py-2 bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 sm:gap-2 shadow-sm font-medium text-sm"
          >
            {isPending || isSubmitting || isUploadingImage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {postStatusValue === "draft" ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {postStatusValue === "draft" ? "Черновик" : "Опубликовать"}
                </span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ==================== ОСНОВНАЯ ОБЛАСТЬ ==================== */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        <form
          id="post-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0"
        >
          {/* ЛЕВАЯ КОЛОНКА: РЕДАКТОР — занимает всё пространство */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[var(--bg-primary)]">
            <div className="flex-1 flex flex-col min-h-0 px-2 sm:px-8 py-2 sm:py-10 gap-2 sm:gap-6">
              {/* Заголовок */}
              <input
                id="title"
                type="text"
                {...register("title")}
                disabled={isDisabled}
                placeholder="Заголовок поста..."
                className="w-full bg-[#0b1f26] text-lg sm:text-2xl md:text-4xl font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none border border-[#1b3a44] rounded-xl px-3 sm:px-6 py-2 sm:py-4 focus:border-[var(--accent)] transition-colors"
              />
              {errors.title && (
                <p className="text-red-400 text-xs sm:text-sm -mt-1 sm:-mt-4">
                  {errors.title.message}
                </p>
              )}

              {/* Редактор — flex-1, чтобы заполнить оставшееся пространство */}
              <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden rounded-xl border border-[var(--border)] transition-colors focus-within:border-[var(--accent)] bg-[var(--bg-primary)]">
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
            </div>
          </div>

          {/* ==================== ДЕСКТОПНАЯ ПАНЕЛЬ ==================== */}
          <aside className="hidden lg:flex w-80 shrink-0 border-l border-[var(--border)] bg-[var(--bg-card)] flex-col relative z-10">
            <div className="p-5 border-b border-[var(--border)] flex items-center gap-2 text-[var(--text-primary)] font-medium shrink-0">
              <Settings2 className="w-4 h-4" />
              <span>Настройки поста</span>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-visible">
              <PostSettingsFields
                categories={categories}
                categoryId={categoryValue}
                setCategoryId={(id) => setValue("categoryId", id)}
                postStatus={postStatusValue || "draft"}
                setPostStatus={(s) => setValue("post_status", s)}
                excerpt={excerptValue}
                setExcerpt={(t) => setValue("excerpt", t)}
                featuredImagePreview={featuredImagePreview}
                isEditingCover={isEditingCover}
                onCoverEdit={handleEditCover}
                onCoverRemove={handleRemoveImage}
                onCoverSelect={handleImageSelect}
                fileInputRef={fileInputRef}
                isDisabled={isDisabled}
                inputClass={inputClass}
              />
            </div>

            <div className="shrink-0 p-5 border-t border-[var(--border)] text-xs text-[var(--text-muted)] text-center bg-[var(--bg-card)]">
              Автор: {user.full_name || user.firstname || user.username}
            </div>
          </aside>
        </form>
      </main>

      {/* ==================== МОБИЛЬНАЯ МОДАЛКА «НАСТРОЙКИ ПОСТА» ==================== */}
      {settingsOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-black/50 flex items-end justify-center"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="bg-[var(--bg-card)] rounded-t-2xl border border-[var(--border)] border-b-0 w-full max-h-[90vh] flex flex-col pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Индикатор-«ручка» для свайпа */}
            <div className="flex justify-center pt-2 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>

            {/* Хедер модалки */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-[var(--border)] shrink-0">
              <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Настройки поста
              </h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 -mr-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Контент модалки — скролл */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <PostSettingsFields
                categories={categories}
                categoryId={categoryValue}
                setCategoryId={(id) => setValue("categoryId", id)}
                postStatus={postStatusValue || "draft"}
                setPostStatus={(s) => setValue("post_status", s)}
                excerpt={excerptValue}
                setExcerpt={(t) => setValue("excerpt", t)}
                featuredImagePreview={featuredImagePreview}
                isEditingCover={isEditingCover}
                onCoverEdit={handleEditCover}
                onCoverRemove={handleRemoveImage}
                onCoverSelect={handleImageSelect}
                fileInputRef={fileInputRef}
                isDisabled={isDisabled}
                inputClass={inputClass}
              />
            </div>

            {/* Кнопка «Готово» — крупная */}
            <div className="shrink-0 p-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-full px-4 py-3 rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:bg-[var(--accent-hover)] transition-colors text-base"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== МОДАЛКА ИСТОРИИ ==================== */}
      {isEditMode && editId && (
        <PostVersionsModal
          postId={editId}
          open={versionsOpen}
          onClose={() => setVersionsOpen(false)}
          onRollback={() => {
            router.refresh();
            if (typeof window !== "undefined") window.location.reload();
          }}
        />
      )}
    </div>
  );
});