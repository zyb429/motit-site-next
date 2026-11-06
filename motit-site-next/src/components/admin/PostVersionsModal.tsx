// src/components/admin/PostVersionsModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import "@/app/(site)/blog/[slug]/post-content.scss";

type Version = {
  id: number;
  title: string | null;
  created_at: string;
  created_by: {
    id: number;
    full_name: string | null;
    username: string | null;
  } | null;
};

type PreviewData = {
  version: Version & { content: unknown };
  html: string;
};

type Props = {
  postId: number | string;
  open: boolean;
  onClose: () => void;
  onRollback: () => void;
};

export function PostVersionsModal({
  postId,
  open,
  onClose,
  onRollback,
}: Props) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rollingBackId, setRollingBackId] = useState<number | null>(null);

  // защита от race condition при быстром клике по разным версиям
  const previewAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch(`/api/posts/${postId}/versions`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Version[]) => setVersions(data))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Ошибка загрузки"),
      )
      .finally(() => setLoading(false));
  }, [open, postId]);

  // сбрасываем состояние превью при закрытии модалки
  useEffect(() => {
    if (open) return;
    previewAbortRef.current?.abort();
    setPreview(null);
    setPreviewData(null);
    setPreviewError(null);
    setPreviewLoading(false);
  }, [open]);

  const loadPreview = async (versionId: number) => {
    // повторный клик по той же версии — скрыть
    if (preview === versionId) {
      previewAbortRef.current?.abort();
      setPreview(null);
      setPreviewData(null);
      setPreviewError(null);
      setPreviewLoading(false); // ← сбрасываем лоадер, если он «залип»
      return;
    }

    // отменяем предыдущий запрос, если он ещё летит
    previewAbortRef.current?.abort();
    const controller = new AbortController();
    previewAbortRef.current = controller;

    setPreview(versionId);
    setPreviewData(null);
    setPreviewError(null);
    setPreviewLoading(true);

    try {
      const res = await fetch(
        `/api/posts/${postId}/versions/${versionId}`,
        { signal: controller.signal, cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as PreviewData;
      // если за это время пользователь уже выбрал другую версию — игнорируем
      if (controller.signal.aborted) return;
      setPreviewData(data);
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") return;
      setPreviewError(
        e instanceof Error ? e.message : "Не удалось загрузить превью",
      );
    } finally {
      if (!controller.signal.aborted) setPreviewLoading(false);
    }
  };

  const rollback = async (versionId: number) => {
    if (
      !confirm(
        "Откатить пост к этой версии? Текущее состояние будет перезаписано (в историю не попадёт).",
      )
    )
      return;

    setRollingBackId(versionId);
    try {
      const res = await fetch(
        `/api/posts/${postId}/versions/${versionId}/rollback`,
        { method: "POST" },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Ошибка отката: ${body.error ?? res.status}`);
        return;
      }
      onRollback();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Сеть недоступна");
    } finally {
      setRollingBackId(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-(--bg-card) rounded-xl border border-(--border) max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-(--border)">
          <h2 className="text-base sm:text-lg font-bold text-(--text-primary)">
            История версий
          </h2>
          <button
            onClick={onClose}
            className="text-(--text-muted) hover:text-(--text-primary) text-2xl leading-none p-1 -mr-1"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
          {loading && (
            <p className="text-sm text-(--text-muted)">Загрузка…</p>
          )}

          {error && <p className="text-sm text-red-400">Ошибка: {error}</p>}

          {!loading && !error && versions.length === 0 && (
            <p className="text-sm text-(--text-muted)">
              Версий пока нет. Они появятся при следующем сохранении.
            </p>
          )}

          {!loading && versions.length > 0 && (
            <ul className="divide-y divide-(--border)">
              {versions.map((v) => (
                <li key={v.id} className="py-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-(--text-primary)">
                        {new Date(v.created_at).toLocaleString("ru-RU")}
                      </div>
                      <div className="text-xs text-(--text-muted) truncate">
                        {v.created_by?.full_name ||
                          v.created_by?.username ||
                          "—"}{" "}
                        · {v.title || "(без заголовка)"}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 self-start sm:self-auto">
                      <button
                        className="text-xs text-(--accent) hover:underline px-2 py-1 rounded hover:bg-(--accent-dim) sm:px-0 sm:py-0 sm:hover:bg-transparent disabled:opacity-50"
                        onClick={() => loadPreview(v.id)}
                        disabled={rollingBackId !== null}
                      >
                        {preview === v.id ? "Скрыть" : "Просмотр"}
                      </button>
                      <button
                        className="text-xs text-red-400 hover:underline px-2 py-1 rounded hover:bg-red-500/10 sm:px-0 sm:py-0 sm:hover:bg-transparent inline-flex items-center gap-1 disabled:opacity-50"
                        onClick={() => rollback(v.id)}
                        disabled={rollingBackId !== null}
                      >
                        {rollingBackId === v.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : null}
                        Откатить
                      </button>
                    </div>
                  </div>

                  {preview === v.id && (
                    <div className="mt-3 rounded-lg border border-(--border) bg-(--bg-secondary) overflow-hidden">
                      {previewLoading ? (
                        <p className="p-4 text-xs text-(--text-muted)">
                          Загрузка…
                        </p>
                      ) : previewError ? (
                        <p className="p-4 text-xs text-red-400">
                          {previewError}
                        </p>
                      ) : previewData?.html ? (
                        <>
                          <div className="px-4 py-2 text-xs text-(--text-muted) border-b border-(--border)">
                            {previewData.version.title ||
                              "(без заголовка)"}{" "}
                            ·{" "}
                            {new Date(
                              previewData.version.created_at,
                            ).toLocaleString("ru-RU")}
                          </div>

                          <div className="dark">
                            <div
                              className="post-content max-w-none p-3 sm:p-4 max-h-72 sm:max-h-96 overflow-auto"
                              dangerouslySetInnerHTML={{
                                __html: previewData.html,
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <p className="p-4 text-xs text-(--text-muted)">
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
  );
}