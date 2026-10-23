"use client"

import {
  type ChangeEvent,
  type RefObject,
} from "react"
import {
  FileText,
  Tag,
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react"

type Category = {
  id: number
  name: string
  documentId?: string
  slug?: string
}

type PostStatus = "draft" | "published"

export type PostSettingsFieldsProps = {
  // Категория
  categories: Category[]
  categoryId: number | null
  setCategoryId: (id: number | null) => void

  // Статус
  postStatus: PostStatus
  setPostStatus: (status: PostStatus) => void

  // Описание
  excerpt: string
  setExcerpt: (text: string) => void

  // Обложка
  featuredImagePreview: string | null
  isEditingCover: boolean
  onCoverEdit: () => void
  onCoverRemove: () => void
  onCoverSelect: (e: ChangeEvent<HTMLInputElement>) => void
  fileInputRef: RefObject<HTMLInputElement | null>

  // Общее состояние
  isDisabled: boolean

  inputClass: string
}

export function PostSettingsFields({
  categories,
  categoryId,
  setCategoryId,
  postStatus,
  setPostStatus,
  excerpt,
  setExcerpt,
  featuredImagePreview,
  isEditingCover,
  onCoverEdit,
  onCoverRemove,
  onCoverSelect,
  fileInputRef,
  isDisabled,
  inputClass,
}: PostSettingsFieldsProps) {
  return (
    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
      {/* Статус публикации */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Публикация
        </label>
        <select
          id="post_status"
          value={postStatus}
          onChange={(e) => setPostStatus(e.target.value as PostStatus)}
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
          value={categoryId ?? ""}
          onChange={(e) =>
            setCategoryId(e.target.value ? Number(e.target.value) : null)
          }
          className={inputClass}
          disabled={isDisabled}
        >
          <option value="">Без категории</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Краткое описание */}
      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
          <FileText className="w-3 h-3" /> Краткое описание
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={`${inputClass} min-h-[100px] resize-y`}
          disabled={isDisabled}
          placeholder="Пара предложений о чём пост..."
          maxLength={300}
        />
        <p className="text-right text-xs text-[var(--text-muted)]">
          {excerpt.length}/300
        </p>
      </div>

      {/* Обложка */}
      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> Обложка
        </label>

        {featuredImagePreview ? (
          <div className="relative group rounded-lg overflow-hidden border border-[var(--border)]">
            <img
              src={featuredImagePreview}
              alt="Cover"
              className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={onCoverEdit}
            />
            {isEditingCover && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onCoverRemove()
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
          onChange={onCoverSelect}
          className="hidden"
          disabled={isDisabled}
        />
      </div>
    </div>
  )
}