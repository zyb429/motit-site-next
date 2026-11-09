// src/components/cabinet/AddToListModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Check, Plus } from "lucide-react";

interface List {
  id: number;
  name: string;
  _count?: { items: number };
}

export function AddToListModal({
  postId,
  isOpen,
  onClose,
}: {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Загрузка списков пользователя
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch("/api/lists", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: List[]) => setLists(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Загрузка текущих списков, в которых уже есть пост
  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/posts/${postId}/save-state`)
      .then((res) => res.json())
      .then((data) => {
        if (data.listIds) {
          setSelectedIds(new Set(data.listIds));
        }
      })
      .catch(() => {});
  }, [isOpen, postId]);

  const toggleList = async (listId: number) => {
    const isSelected = selectedIds.has(listId);
    
    // Оптимистичное обновление
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isSelected) next.delete(listId);
      else next.add(listId);
      return next;
    });

    try {
      await fetch(`/api/lists/${listId}/items`, {
        method: isSelected ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
    } catch {
      // Откат при ошибке
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (isSelected) next.add(listId);
        else next.delete(listId);
        return next;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Подложка */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Модалка */}
      <div className="relative w-full max-w-sm rounded-xl bg-(--bg-card) border border-(--border) shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-(--border)">
          <h3 className="font-semibold text-(--text-primary)">Сохранить в список</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-(--text-muted) hover:bg-(--bg-secondary) transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-6 text-(--text-muted)">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : lists.length === 0 ? (
            <p className="text-center text-sm text-(--text-muted) py-6">
              У вас пока нет списков.
            </p>
          ) : (
            <div className="space-y-1">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => toggleList(list.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-(--bg-secondary) transition-colors text-left group"
                >
                  <span className="text-sm text-(--text-primary)">{list.name}</span>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    selectedIds.has(list.id)
                      ? "bg-(--accent) border-(--accent) text-(--bg-primary)"
                      : "border-(--border) group-hover:border-(--text-muted)"
                  }`}>
                    {selectedIds.has(list.id) && <Check size={14} />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-(--border) bg-(--bg-secondary)/50">
          <button
            onClick={onClose}
            className="w-full py-2 bg-(--accent) text-(--bg-primary) rounded-lg text-sm font-medium hover:bg-(--accent-hover) transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}