// src/app/admin/posts/StatusToggleButton.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  postId: string;
  currentStatus: "published" | "draft" | string;
}

export function StatusToggleButton({ postId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUpdating, setIsUpdating] = useState(false);

  const isPublished = currentStatus === "published";
  const nextStatus = isPublished ? "draft" : "published";

  const handleToggle = async () => {
    const label = isPublished ? "снять с публикации" : "опубликовать";
    if (!confirm(`Вы уверены, что хотите ${label} пост?`)) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/posts/${postId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_status: nextStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Не удалось изменить статус");
      }

      startTransition(() => router.refresh());
    } catch (error) {
      console.error("❌ Status toggle error:", error);
      alert(error instanceof Error ? error.message : "Ошибка смены статуса");
    } finally {
      setIsUpdating(false);
    }
  };

  const disabled = isPending || isUpdating;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      title={isPublished ? "Снять с публикации" : "Опубликовать"}
      className={`p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 ${isPublished
        ? "text-yellow-500 hover:bg-yellow-500/40"
        : "text-(--accent) hover:bg-(--accent-dim)"
        }`}
    >
      {disabled ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPublished ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  );
}
