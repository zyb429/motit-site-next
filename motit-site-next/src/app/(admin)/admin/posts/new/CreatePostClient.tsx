"use client";

import {
  useState,
  useEffect,
  useTransition,
  useMemo,
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
  Users,
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

type PostAuthor = {
  id: number;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
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
  canEdit?: boolean;
  postAuthor?: PostAuthor | null;
  children?: React.ReactNode;
};

const inputClass =
  "w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors text-sm";

export default memo(function CreatePostClient({
  initialUser,
  initialCategories,
  canEdit = true,
  postAuthor = null,
  children,
}: CreatePostProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);

  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
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
  const [collaboratorsOpen, setCollaboratorsOpen] = useState(false);

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
  const titleValue = watch("title") || "";
  const slugValue = useMemo(() => generateSlug(titleValue), [titleValue]);

  useEffect(() => {
    if (isEditMode || !titleValue.trim()) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");

    const controller = new AbortController();
    let isActive = true;

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/posts/check-slug?slug=${encodeURIComponent(slugValue)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok || !isActive) {
          if (isActive) setSlugStatus("idle");
          return;
        }

        const result = await response.json();

        if (!isActive) return;

        setSlugStatus(result.available ? "available" : "taken");
      } catch {
        if (isActive) setSlugStatus("idle");
      }
    }, 500);

    return () => {
      isActive = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [isEditMode, titleValue, slugValue]);

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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

      const { openEditorModal } =
        await import("@rageshpikalmunde/rp-image-editor");

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
            const emptyDoc = {
              type: "doc",
              content: [{ type: "paragraph" }],
            };

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
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[var(--bg-primary)] p-4">
        <div className="max-w-md rounded-lg border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-400">
          <p className="font-medium">Доступ запрещен</p>
          <p className="mt-1 text-sm">
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--bg-primary)] font-sans">
      <header className="flex shrink-0 items-center justify-between gap-1.5 border-b border-[var(--border)] bg-[var(--bg-primary)]/95 px-2 py-1.5 backdrop-blur-md sm:gap-3 sm:px-6 sm:py-3">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-4">
          <Link
            href="/admin/posts"
            className="shrink-0 rounded-full p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] sm:p-2"
            aria-label="Назад к постам"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">
              {isEditMode ? "Редактирование" : "Новый пост"}
            </h1>

            <p className="truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
              {postStatusValue === "draft" ? "Черновик" : "Публикация"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          {isEditMode && editId && (
            <button
              type="button"
              onClick={() => setCollaboratorsOpen(true)}
              className="rounded-md p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] lg:hidden"
              aria-label="Соавторы"
              title="Соавторы"
            >
              <Users className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            disabled={isDisabled}
            className="rounded-md p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] lg:hidden"
            aria-label="Настройки поста"
            title="Настройки"
          >
            <Settings2 className="h-5 w-5" />
          </button>

          {isEditMode && editId && (
            <button
              type="button"
              onClick={() => setVersionsOpen(true)}
              disabled={isDisabled}
              className="rounded-md p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              aria-label="История версий"
              title="История"
            >
              <History className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => router.back()}
            disabled={isDisabled}
            className="rounded-md p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Отмена"
            title="Отмена"
          >
            <X className="h-5 w-5" />
          </button>

          {canEdit && (
            <button
              type="submit"
              form="post-form"
              disabled={isDisabled}
              aria-label={
                postStatusValue === "draft"
                  ? "Сохранить черновик"
                  : "Опубликовать"
              }
              className="ml-0.5 flex items-center gap-1 rounded-md bg-[var(--accent)] px-2.5 py-2 text-sm font-medium text-[var(--bg-primary)] shadow-sm transition-all hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:ml-2 sm:gap-2 sm:px-5"
            >
              {isPending || isSubmitting || isUploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {postStatusValue === "draft" ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}

                  <span className="hidden sm:inline">
                    {postStatusValue === "draft" ? "Черновик" : "Опубликовать"}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <form
          id="post-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row"
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--bg-primary)]">
            <div className="flex min-h-0 flex-1 flex-col gap-2 px-2 py-2 sm:gap-6 sm:px-8 sm:py-10">
              <input
                id="title"
                type="text"
                {...register("title")}
                disabled={isDisabled}
                placeholder="Заголовок поста..."
                className="w-full rounded-xl border border-[#1b3a44] bg-[#0b1f26] px-3 py-2 text-lg font-bold text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)]/50 focus:border-[var(--accent)] sm:px-6 sm:py-4 sm:text-2xl md:text-4xl"
              />

              {errors.title && (
                <p className="-mt-1 text-xs text-red-400 sm:-mt-4 sm:text-sm">
                  {errors.title.message}
                </p>
              )}

              {!isEditMode && slugStatus === "checking" && (
                <p className="text-xs text-[var(--text-muted)]">
                  Проверяем доступность URL…
                </p>
              )}

              {!isEditMode && slugStatus === "taken" && (
                <p className="text-xs text-amber-400">
                  URL «{slugValue}» уже занят. При сохранении к нему будет
                  добавлена дата и время.
                </p>
              )}

              {!isEditMode && slugStatus === "available" && (
                <p className="text-xs text-emerald-400">
                  URL «{slugValue}» доступен.
                </p>
              )}

              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] transition-colors focus-within:border-[var(--accent)]">
                <SimpleEditor
                  initialContent={content}
                  onChange={(json) => setValue("content", JSON.stringify(json))}
                  editable={!isDisabled}
                />
              </div>

              {errors.content && (
                <p className="text-sm text-red-400">
                  {errors.content.message}
                </p>
              )}
            </div>
          </div>

          <aside className="relative z-10 hidden w-80 shrink-0 flex-col border-l border-[var(--border)] bg-[var(--bg-card)] lg:flex">
            <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] p-5 font-medium text-[var(--text-primary)]">
              <Settings2 className="h-4 w-4" />
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

            {children && (
              <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-card)] p-5">
                {children}
              </div>
            )}

            <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-card)] p-5">
              <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
                Автор поста
              </p>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--text-primary)]">
                  {postAuthor?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={postAuthor.avatar_url}
                      alt={postAuthor.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (
                      postAuthor?.full_name ||
                      postAuthor?.username ||
                      user.full_name ||
                      user.username
                    )
                      .slice(0, 2)
                      .toUpperCase()
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {postAuthor?.full_name ||
                      postAuthor?.username ||
                      user.full_name ||
                      user.username}
                  </p>

                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {postAuthor?.username ? `@${postAuthor.username}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </main>

      {settingsOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 lg:hidden"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full flex-col rounded-t-2xl border-b-0 border-[var(--border)] bg-[var(--bg-card)] pb-[env(safe-area-inset-bottom)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 justify-center pb-1 pt-2">
              <div className="h-1 w-10 rounded-full bg-[var(--border)]" />
            </div>

            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 pb-3">
              <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                <Settings2 className="h-4 w-4" />
                Настройки поста
              </h2>

              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="-mr-2 rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

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

            <div className="shrink-0 border-t border-[var(--border)] p-3">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-base font-semibold text-[var(--bg-primary)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {collaboratorsOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 lg:hidden"
          onClick={() => setCollaboratorsOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full flex-col rounded-t-2xl border-b-0 border-[var(--border)] bg-[var(--bg-card)] pb-[env(safe-area-inset-bottom)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 justify-center pb-1 pt-2">
              <div className="h-1 w-10 rounded-full bg-[var(--border)]" />
            </div>

            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 pb-3">
              <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                <Users className="h-4 w-4" />
                Соавторы
              </h2>

              <button
                type="button"
                onClick={() => setCollaboratorsOpen(false)}
                className="-mr-2 rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              {children}
            </div>

            <div className="shrink-0 border-t border-[var(--border)] p-3">
              <button
                type="button"
                onClick={() => setCollaboratorsOpen(false)}
                className="w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-base font-semibold text-[var(--bg-primary)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditMode && editId && (
        <PostVersionsModal
          postId={editId}
          open={versionsOpen}
          onClose={() => setVersionsOpen(false)}
          onRollback={() => {
            router.refresh();

            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
});