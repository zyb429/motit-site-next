// src/components/cabinet/SavedPostActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Loader2,
  MoreHorizontal,
  FolderPlus,
  ListX,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AddToListModal } from "./AddToListModal";

export function SavedPostActions({
  postId,
  listId,
  isList = false,
}: {
  postId?: number;
  listId?: number;
  isList?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleRemove() {
    const message = isList
      ? "Удалить этот список целиком?"
      : listId
        ? "Удалить этот пост из списка?"
        : "Удалить этот пост из избранного?";

    if (!confirm(message)) return;

    setLoading(true);
    try {
      let url = "";
      let options: RequestInit = { method: "DELETE" };

      if (isList && listId) {
        url = `/api/lists/${listId}`;
      } else if (listId && postId) {
        url = `/api/lists/${listId}/items`;
        options = {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        };
      } else if (postId) {
        url = `/api/favorites/${postId}`;
      }

      const res = await fetch(url, options);
      if (res.ok) {
        if (isList && listId) {
          router.push("/cabinet/saved");
        } else {
          router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  // Если это удаление самого списка — оставляем кнопку, но с новым стилем
  if (isList) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="p-2 rounded-lg text-(--text-muted) hover:bg-(--bg-secondary) transition-colors"
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <MoreHorizontal size={18} />}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[160px] rounded-lg border border-(--border) bg-(--bg-card) p-1 shadow-xl z-50 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
            sideOffset={5}
            align="end"
          >
            <DropdownMenu.Item
              onSelect={handleRemove}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-500 rounded cursor-pointer outline-none hover:bg-red-500/10"
            >
              <ListX size={14} /> Удалить список
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  // Меню для поста (в избранном или внутри списка)
  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="p-2 rounded-lg text-(--text-muted) hover:bg-(--bg-secondary) transition-colors"
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <MoreHorizontal size={18} />}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[180px] rounded-lg border border-(--border) bg-(--bg-card) p-1 shadow-xl z-50 animate-in fade-in zoom-in-95"
            sideOffset={5}
            align="end"
          >
            <DropdownMenu.Item
              onSelect={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-(--text-primary) rounded cursor-pointer outline-none hover:bg-(--bg-secondary)"
            >
              <FolderPlus size={14} /> В список...
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={handleRemove}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-500 rounded cursor-pointer outline-none hover:bg-red-500/10"
            >
              <Trash2 size={14} /> {listId ? "Убрать из списка" : "Убрать из избранного"}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Модалка добавления в список */}
      {postId && (
        <AddToListModal
          postId={postId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}