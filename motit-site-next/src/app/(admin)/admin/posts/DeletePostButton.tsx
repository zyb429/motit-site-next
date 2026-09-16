// src/app/admin/posts/DeletePostButton.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  postId: string;
  postTitle?: string;
}

export function DeletePostButton({ postId, postTitle }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Удалить пост «${postTitle || postId}»?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/delete`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let details = "";
        try {
          details = await res.text();
        } catch {
          details = "(не удалось прочитать тело ответа)";
        }
        console.error("❌ DELETE failed:", res.status, details);
        throw new Error(`Не удалось удалить пост (${res.status}): ${details}`);
      }

      startTransition(() => router.refresh());
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert(error instanceof Error ? error.message : "Ошибка удаления");
    } finally {
      setIsDeleting(false);
    }
  };

  const disabled = isPending || isDeleting;

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={disabled}
      title="Удалить"
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {disabled ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
