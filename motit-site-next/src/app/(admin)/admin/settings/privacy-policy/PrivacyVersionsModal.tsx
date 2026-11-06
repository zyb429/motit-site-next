// src/app/(admin)/admin/settings/privacy-policy/PrivacyVersionsModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, RotateCcw, FileText } from "lucide-react";
import type { JSONContent } from "@tiptap/core";

type PrivacyMode = "page" | "document" | "file";

type Version = {
  id: number;
  content: JSONContent | null;
  displayMode: PrivacyMode;
  fileId: number | null;
  fileName: string | null;
  created_at: string;
  created_by: { id: number; username: string | null; full_name: string | null } | null;
};

const MODE_LABELS: Record<PrivacyMode, string> = {
  page: "Страница",
  document: "Документ",
  file: "Файл",
};

export function PrivacyVersionsModal({
  open,
  onClose,
  onRolledBack,
  currentMode,
}: {
  open: boolean;
  onClose: () => void;
  onRolledBack: (next: {
    content: JSONContent | null;
    displayMode: PrivacyMode;
  }) => void;
  currentMode: PrivacyMode;
}) {
  const [activeTab, setActiveTab] = useState<PrivacyMode>(currentMode);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rollingBackId, setRollingBackId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: PrivacyMode) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/privacy-policy/versions?displayMode=${mode}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { versions: Version[] };
      setVersions(data.versions ?? []);
    } catch (e) {
      console.error(e);
      setError("Не удалось загрузить историю");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setActiveTab(currentMode);
    load(currentMode);
  }, [open, currentMode, load]);

  const handleTabChange = (mode: PrivacyMode) => {
    setActiveTab(mode);
    load(mode);
  };

  const handleRollback = useCallback(
    async (v: Version) => {
      if (
        !confirm(
          `Откатить к версии от ${new Date(v.created_at).toLocaleString("ru-RU")}? Текущая версия будет сохранена в историю.`,
        )
      ) {
        return;
      }
      setRollingBackId(v.id);
      try {
        const res = await fetch("/api/admin/privacy-policy/rollback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId: v.id }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          alert(`Ошибка: ${body.error ?? res.status}`);
          return;
        }
        onRolledBack({
          content: v.content,
          displayMode: v.displayMode,
        });
        onClose();
      } catch (e) {
        console.error(e);
        alert("Сеть недоступна");
      } finally {
        setRollingBackId(null);
      }
    },
    [onClose, onRolledBack],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-(--bg-card) rounded-xl border border-(--border) w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-(--border)">
          <h2 className="text-lg font-semibold text-(--text-primary)">
            История версий
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-(--text-muted) hover:text-(--text-primary) p-1 rounded"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1 p-2 border-b border-(--border) bg-(--bg-secondary)">
          {(Object.keys(MODE_LABELS) as PrivacyMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleTabChange(m)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeTab === m
                  ? "bg-(--accent) text-(--bg-primary)"
                  : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-card)"
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-(--text-muted)">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Загрузка...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400 text-sm">
              {error}
              <button
                type="button"
                onClick={() => load(activeTab)}
                className="block mx-auto mt-3 px-3 py-1.5 text-xs rounded-md bg-(--accent) text-(--bg-primary)"
              >
                Повторить
              </button>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-(--text-muted) text-sm">
              История для режима «{MODE_LABELS[activeTab]}» пуста
            </div>
          ) : (
            <ul className="space-y-2">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-(--border) hover:border-(--border-hover) transition-colors"
                >
                  <div className="min-w-0 flex items-start gap-2">
                    {v.displayMode === "file" && (
                      <FileText className="w-4 h-4 text-(--accent) shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm text-(--text-primary) truncate">
                        {new Date(v.created_at).toLocaleString("ru-RU")}
                      </div>
                      <div className="text-xs text-(--text-muted) truncate">
                        {v.displayMode === "file"
                          ? v.fileName ?? "файл"
                          : `Режим: ${MODE_LABELS[v.displayMode]}`}{" "}
                        · Автор:{" "}
                        {v.created_by?.full_name ||
                          v.created_by?.username ||
                          "—"}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRollback(v)}
                    disabled={rollingBackId === v.id}
                    className="px-3 py-1.5 text-xs rounded-md bg-(--accent) text-(--bg-primary) hover:bg-(--accent-hover) transition-colors shrink-0 inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {rollingBackId === v.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3 h-3" />
                    )}
                    Откатить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}