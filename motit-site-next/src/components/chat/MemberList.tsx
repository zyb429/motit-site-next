// src/components/chat/MemberList.tsx
"use client";

import { UserMinus, Crown } from "lucide-react";

type Member = {
  uuid: string;
  role: string;
  user: {
    uuid: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
};

export function MemberList({
  members,
  currentUserUuid,
  canManage,
  onRemoveAction,
}: {
  members: Member[];
  currentUserUuid: string;
  canManage: boolean;
  onRemoveAction?: (userUuid: string) => void;
}) {
  return (
    <div className="p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-(--text-muted) mb-2">
        Участники ({members.length})
      </div>
      <ul className="space-y-1">
        {members.map((m) => {
          const isCurrentUser = m.user.uuid === currentUserUuid;
          return (
            <li
              key={m.uuid}
              className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-(--bg-primary)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-(--bg-primary) border border-(--border) flex items-center justify-center shrink-0 overflow-hidden">
                  {m.user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.user.avatar_url}
                      alt={m.user.full_name ?? ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-medium text-(--text-muted)">
                      {(m.user.full_name ?? m.user.username ?? "?")
                        .slice(0, 1)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex items-center gap-1">
                  <span className="text-xs text-(--text-primary) truncate">
                    {m.user.full_name ?? m.user.username ?? "—"}
                    {isCurrentUser && (
                      <span className="text-(--text-muted)"> (вы)</span>
                    )}
                  </span>
                  {(m.role === "owner" || m.role === "admin") && (
                    <span
                      className="inline-flex shrink-0"
                      title={m.role === "owner" ? "Владелец" : "Администратор"}
                    >
                      <Crown size={10} className="text-(--accent)" />
                    </span>
                  )}
                </div>
              </div>

              {canManage && !isCurrentUser && m.role !== "owner" && onRemoveAction && (
                <button
                  type="button"
                  onClick={() => onRemoveAction(m.user.uuid)}
                  className="p-1 text-(--text-muted) hover:text-red-400"
                  title="Удалить из чата"
                >
                  <UserMinus size={12} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
