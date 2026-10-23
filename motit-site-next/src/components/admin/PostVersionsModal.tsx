"use client"

import { useEffect, useState } from "react"
import "@/app/(site)/blog/[slug]/post-content.scss"

type Version = {
  id: number
  title: string | null
  created_at: string
  created_by: {
    id: number
    full_name: string | null
    username: string | null
  } | null
}

type PreviewData = {
  version: Version & { content: unknown }
  html: string
}

type Props = {
  postId: number | string
  open: boolean
  onClose: () => void
  onRollback: () => void
}

export function PostVersionsModal({ postId, open, onClose, onRollback }: Props) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<number | null>(null)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    fetch(`/api/posts/${postId}/versions`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: Version[]) => setVersions(data))
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false))
  }, [open, postId])

  const loadPreview = async (versionId: number) => {
    if (preview === versionId) {
      setPreview(null)
      setPreviewData(null)
      return
    }
    setPreview(versionId)
    setPreviewData(null)
    const res = await fetch(`/api/posts/${postId}/versions/${versionId}`)
    if (res.ok) {
      setPreviewData(await res.json())
    }
  }

  const rollback = async (versionId: number) => {
    if (
      !confirm(
        "Откатить пост к этой версии? Текущее состояние будет перезаписано (в историю не попадёт).",
      )
    )
      return

    const res = await fetch(
      `/api/posts/${postId}/versions/${versionId}/rollback`,
      { method: "POST" },
    )
    if (!res.ok) {
      alert("Ошибка отката")
      return
    }
    onRollback()
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            История версий
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && <p className="text-sm text-[var(--text-muted)]">Загрузка…</p>}

          {error && <p className="text-sm text-red-400">Ошибка: {error}</p>}

          {!loading && !error && versions.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">
              Версий пока нет. Они появятся при следующем сохранении.
            </p>
          )}

          {!loading && versions.length > 0 && (
            <ul className="divide-y divide-[var(--border)]">
              {versions.map((v) => (
                <li key={v.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        {new Date(v.created_at).toLocaleString("ru-RU")}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] truncate">
                        {v.created_by?.full_name ||
                          v.created_by?.username ||
                          "—"}{" "}
                        · {v.title || "(без заголовка)"}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        className="text-xs text-[var(--accent)] hover:underline"
                        onClick={() => loadPreview(v.id)}
                      >
                        {preview === v.id ? "Скрыть" : "Просмотр"}
                      </button>
                      <button
                        className="text-xs text-red-400 hover:underline"
                        onClick={() => rollback(v.id)}
                      >
                        Откатить
                      </button>
                    </div>
                  </div>

                    {preview === v.id && (
                    <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
                        {!previewData ? (
                        <p className="p-4 text-xs text-[var(--text-muted)]">Загрузка…</p>
                        ) : previewData.html ? (
                        <>
                            <div className="px-4 py-2 text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
                            {previewData.version.title || "(без заголовка)"} ·{" "}
                            {new Date(previewData.version.created_at).toLocaleString("ru-RU")}
                            </div>

                            {/* Обёртка `.dark` — чтобы post-content.scss применил тёмные стили */}
                            <div className="dark">
                            <div
                                className="post-content max-w-none p-4 max-h-96 overflow-auto"
                                dangerouslySetInnerHTML={{ __html: previewData.html }}
                            />
                            </div>
                        </>
                        ) : (
                        <p className="p-4 text-xs text-[var(--text-muted)]">
                            У версии нет контента
                        </p>
                        )}
                    </div>
                    )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}