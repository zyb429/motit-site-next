// src/components/chat/DeleteMessageDialog.tsx
"use client";

import { useState } from "react";

export function DeleteMessageDialog({
  isOwn,
  onCancelAction,
  onDeleteAction,
}: {
  isOwn: boolean;
  onCancelAction: () => void;
  onDeleteAction: (scope: "self" | "everyone") => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  async function run(scope: "self" | "everyone") {
    setLoading(true);
    try {
      await onDeleteAction(scope);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-110 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-(--bg-card) border border-(--border) rounded-xl w-full max-w-sm">
        <div className="p-4 border-b border-(--border)">
          <h3 className="text-sm font-semibold text-(--text-primary)">Удалить сообщение?</h3>
        </div>
        <div className="p-2">
          <button
            type="button"
            onClick={() => run("self")}
            disabled={loading}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-(--text-primary) hover:bg-(--bg-primary) disabled:opacity-50"
          >
            Удалить у себя
          </button>
          {isOwn && (
            <button
              type="button"
              onClick={() => run("everyone")}
              disabled={loading}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              Удалить у всех
            </button>
          )}
        </div>
        <div className="p-3 border-t border-(--border)">
          <button
            type="button"
            onClick={onCancelAction}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg border border-(--border) text-sm text-(--text-secondary) hover:bg-(--bg-primary) disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
