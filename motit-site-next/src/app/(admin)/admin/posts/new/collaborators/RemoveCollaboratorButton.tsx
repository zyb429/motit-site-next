"use client";

import { useTransition } from "react";
import { removeCollaboratorAction } from "./actions";

export function RemoveCollaboratorButton({
  postId,
  collaboratorId,
}: {
  postId: string;
  collaboratorId: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Удалить соавтора?")) return;

        startTransition(async () => {
          await removeCollaboratorAction(postId, collaboratorId);
        });
      }}
      className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isPending ? "..." : "Удалить"}
    </button>
  );
}