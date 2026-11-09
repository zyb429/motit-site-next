// src/components/cabinet/RemoveFromListButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function RemoveFromListButton({
  listId,
  postId,
}: {
  listId: number;
  postId: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!confirm("Удалить этот пост из списка?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (res.ok) {
        router.refresh(); // Перезагружаем серверный компонент, чтобы пост исчез
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={loading}
      className="p-2 rounded-lg text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      title="Удалить из списка"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}