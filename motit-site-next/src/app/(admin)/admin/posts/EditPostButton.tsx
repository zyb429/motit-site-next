// src/app/admin/posts/EditPostButton.tsx
import Link from "next/link";
import { Edit } from "lucide-react";

interface Props {
  postId: string;
}

export function EditPostButton({ postId }: Props) {
  return (
    <Link
      href={`/admin/posts/${postId}`}
      className="p-1.5 text-(--accent) hover:bg-(--accent-dim) rounded-lg transition-colors shrink-0"
      title="Редактировать"
    >
      <Edit className="w-4 h-4" />
    </Link>
  );
}
