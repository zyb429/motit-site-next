// src/components/chat/ChatSettingsForm.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useChatSocket } from "@/hooks/useChatSocket";
import {
  Bell,
  BellOff,
  Pin,
  PinOff,
  LogOut,
  Trash2,
  UserPlus,
  Save,
  Users,
  X,
  Crown,
  Shield,
} from "lucide-react";

type Role = "owner" | "admin" | "member";

type ChatSettingsFormProps = {
  chat: {
    uuid: string;
    kind: string;
    name: string | null;
    description: string | null;
    avatar_url: string | null;
  };
  canEdit: boolean;
  canDelete: boolean;
  isMuted: boolean;
  isPinned: boolean;
  isDirect: boolean;
  isSaved: boolean;
  basePath: string;
  myRole?: Role;
  members?: Array<{
    uuid: string;
    user: {
      uuid: string;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
    role: Role;
  }>;
  currentUserUuid?: string;
};

/**
 * Кого текущий пользователь может удалить из чата?
 * - member — никого
 * - admin — только member (не owner, не другого admin)
 * - owner — admin и member (не себя)
 */
function canRemoveMember(myRole: Role, targetRole: Role): boolean {
  if (myRole === "member") return false;
  if (targetRole === "owner") return false;
  if (myRole === "admin" && targetRole === "admin") return false;
  return true;
}

/**
 * Может ли текущий пользователь менять роль этого участника?
 * - только owner
 * - и target не owner (владельца не трогаем)
 */
function canChangeRole(myRole: Role, targetRole: Role): boolean {
  if (myRole !== "owner") return false;
  if (targetRole === "owner") return false;
  return true;
}

/**
 * Может ли текущий пользователь передать владение этому участнику?
 * - только owner
 * - target не owner (уже владелец)
 * - target не сам пользователь
 */
function canTransferOwnership(myRole: Role, targetRole: Role): boolean {
  return myRole === "owner" && targetRole !== "owner";
}

export function ChatSettingsForm({
  chat,
  canEdit,
  canDelete,
  isMuted,
  isPinned,
  isDirect,
  isSaved,
  basePath,
  myRole = "member",
  members = [],
  currentUserUuid,
}: ChatSettingsFormProps) {
  const router = useRouter();

  const [name, setName] = useState(chat.name ?? "");
  const [description, setDescription] = useState(chat.description ?? "");
  const [muted, setMuted] = useState(isMuted);
  const [pinned, setPinned] = useState(isPinned);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [membersState, setMembersState] = useState(members);
  const [transferTo, setTransferTo] = useState<{
    userUuid: string;
    userName: string;
  } | null>(null);

  useChatSocket({
    userUuid: currentUserUuid ?? "",
    chatUuids: [],
    onChatUpdatedAction: useCallback(
      (payload: {
        event: "chat:updated";
        chatUuid: string;
        patch: Partial<{ is_muted: boolean; is_pinned: boolean }>;
      }) => {
        if (payload.chatUuid !== chat.uuid) return;
        if (payload.patch.is_muted !== undefined) setMuted(payload.patch.is_muted);
        if (payload.patch.is_pinned !== undefined) setPinned(payload.patch.is_pinned);
      },
      [chat.uuid],
    ),
  });

  // ---------- Сохранение ----------
  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/chats/${chat.uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(
          typeof d.error === "string" ? d.error : "Не удалось сохранить",
        );
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  // ---------- Mute / Pin ----------
  async function handleToggleMute() {
    const prev = muted;
    setMuted((v) => !v);
    const res = await fetch(`/api/chat/chats/${chat.uuid}/mute`, {
      method: "POST",
    });
    if (!res.ok) {
      setMuted(prev);
      alert("Не удалось переключить уведомления");
    }
  }

  async function handleTogglePin() {
    const prev = pinned;
    setPinned((v) => !v);
    const res = await fetch(`/api/chat/chats/${chat.uuid}/pin`, {
      method: "POST",
    });
    if (!res.ok) {
      setPinned(prev);
      alert("Не удалось переключить закрепление");
    }
  }

  // ---------- Leave / Delete ----------
  async function handleLeave() {
    if (!confirm("Покинуть чат?")) return;
    const res = await fetch(`/api/chat/chats/${chat.uuid}/leave`, {
      method: "POST",
    });
    if (res.ok) {
      router.push(basePath);
      router.refresh();
    } else {
      alert("Не удалось покинуть чат");
    }
  }

  async function handleDelete() {
    if (!confirm("Удалить чат? Действие необратимо.")) return;
    const res = await fetch(`/api/chat/chats/${chat.uuid}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push(basePath);
      router.refresh();
    } else {
      alert("Не удалось удалить чат");
    }
  }

  // ---------- Участники ----------
  async function handleRemoveMember(userUuid: string) {
    if (!confirm("Удалить участника из чата?")) return;
    const res = await fetch(
      `/api/chat/chats/${chat.uuid}/members/${userUuid}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      setMembersState((prev) => prev.filter((m) => m.user.uuid !== userUuid));
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(
        typeof d.error === "string" ? d.error : "Не удалось удалить участника",
      );
    }
  }

  async function handleChangeRole(
    userUuid: string,
    role: "admin" | "member",
  ) {
    const res = await fetch(
      `/api/chat/chats/${chat.uuid}/members/${userUuid}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      },
    );
    if (res.ok) {
      setMembersState((prev) =>
        prev.map((m) => (m.user.uuid === userUuid ? { ...m, role } : m)),
      );
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(typeof d.error === "string" ? d.error : "Не удалось изменить роль");
    }
  }

  return (
    <div className="space-y-6">
      {/* Основные данные */}
      {canEdit && (
        <section className="p-5 rounded-xl bg-(--bg-card) border border-(--border) space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-(--text-muted) mb-1">
              Название
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-(--text-muted) mb-1">
              Описание
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Save size={14} />
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </section>
      )}

      {/* Участники */}
      {canEdit && !isDirect && !isSaved && (
        <section className="p-5 rounded-xl bg-(--bg-card) border border-(--border)">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-(--accent)" />
              <div className="text-sm font-medium text-(--text-primary)">
                Участники · {membersState.length}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddMember(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-(--text-secondary) hover:text-(--accent) hover:border-(--accent) text-sm transition-colors"
            >
              <UserPlus size={14} />
              Добавить
            </button>
          </div>

          <ul className="space-y-2">
            {membersState.map((m) => {
              const isOwner = m.role === "owner";
              const isAdmin = m.role === "admin";
              const isMe = m.user.uuid === currentUserUuid;
              const showRoleSelect = !isMe && canChangeRole(myRole, m.role);
              const showRemove = !isMe && canRemoveMember(myRole, m.role);
              const showTransfer =
                !isMe && canTransferOwnership(myRole, m.role);

              return (
                <li
                  key={m.uuid}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-(--bg-primary) transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-(--bg-primary) border border-(--border) flex items-center justify-center shrink-0 overflow-hidden">
                    {m.user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.user.avatar_url}
                        alt={m.user.full_name ?? "—"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-(--text-muted)">
                        {(m.user.full_name ?? m.user.username ?? "?")[0]}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-(--text-primary) truncate">
                      {m.user.full_name ?? m.user.username ?? "—"}
                      {isMe && (
                        <span className="text-(--text-muted) font-normal">
                          {" "}
                          (вы)
                        </span>
                      )}
                    </div>
                  </div>

                  {(isOwner || isAdmin) && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-(--accent-dim) text-(--accent) border border-(--border)">
                      {isOwner ? <Crown size={10} /> : <Shield size={10} />}
                      {isOwner ? "владелец" : "админ"}
                    </span>
                  )}

                  <div className="shrink-0 flex items-center gap-1">
                    {showRoleSelect && (
                      <select
                        value={m.role}
                        onChange={(e) =>
                          handleChangeRole(
                            m.user.uuid,
                            e.target.value as "admin" | "member",
                          )
                        }
                        className="text-xs px-2 py-1 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-secondary) focus:border-(--accent) outline-none"
                      >
                        <option value="member">Участник</option>
                        <option value="admin">Админ</option>
                      </select>
                    )}

                    {showTransfer && (
                      <button
                        type="button"
                        onClick={() =>
                          setTransferTo({
                            userUuid: m.user.uuid,
                            userName:
                              m.user.full_name ?? m.user.username ?? "—",
                          })
                        }
                        className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--accent) hover:bg-(--accent-dim) transition-colors"
                        title="Передать владение"
                      >
                        <Crown size={14} />
                      </button>
                    )}

                    {showRemove && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.user.uuid)}
                        className="p-1.5 rounded-lg text-(--text-muted) hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Удалить из чата"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Mute / Pin */}
      {!isSaved && (
        <section className="p-5 rounded-xl bg-(--bg-card) border border-(--border) space-y-3">
          <button
            type="button"
            onClick={handleToggleMute}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2 text-sm text-(--text-primary)">
              {muted ? <BellOff size={16} /> : <Bell size={16} />}
              {muted ? "Включить уведомления" : "Отключить уведомления"}
            </div>
            <Toggle on={muted} />
          </button>

          <button
            type="button"
            onClick={handleTogglePin}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2 text-sm text-(--text-primary)">
              {pinned ? <PinOff size={16} /> : <Pin size={16} />}
              {pinned ? "Открепить чат" : "Закрепить чат"}
            </div>
            <Toggle on={pinned} />
          </button>
        </section>
      )}

      {/* Опасные действия */}
      {!isDirect && !isSaved && (
        <section className="p-5 rounded-xl bg-red-500/5 border border-red-500/20 space-y-3">
          <div className="text-sm font-medium text-red-400">
            Опасные действия
          </div>

          <button
            type="button"
            onClick={handleLeave}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
          >
            <LogOut size={14} />
            Покинуть чат
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
            >
              <Trash2 size={14} />
              Удалить чат
            </button>
          )}
        </section>
      )}

      {showAddMember && (
        <AddMemberDialog
          chatUuid={chat.uuid}
          existingUuids={membersState.map((m) => m.user.uuid)}
          onCloseAction={() => setShowAddMember(false)}
          onAddedAction={(member) => {
            setMembersState((prev) => [...prev, member]);
            setShowAddMember(false);
            router.refresh();
          }}
        />
      )}

      {transferTo && (
        <TransferOwnershipDialog
          chatUuid={chat.uuid}
          toUuid={transferTo.userUuid}
          toName={transferTo.userName}
          onCloseAction={() => setTransferTo(null)}
          onTransferredAction={() => {
            setTransferTo(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-(--accent)" : "bg-(--border)"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-(--bg-card) transform transition-transform ${
          on ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </span>
  );
}

// ---------- Диалог добавления участника ----------
function AddMemberDialog({
  chatUuid,
  existingUuids,
  onCloseAction,
  onAddedAction,
}: {
  chatUuid: string;
  existingUuids: string[];
  onCloseAction: () => void;
  onAddedAction: (member: {
    uuid: string;
    user: {
      uuid: string;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
    role: Role;
  }) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    Array<{
      uuid: string;
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  async function handleSearch(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/chat/users/search?q=${encodeURIComponent(value)}&exclude=${existingUuids.join(",")}`,
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(userUuid: string) {
    const res = await fetch(`/api/chat/chats/${chatUuid}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userUuid, showHistory }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(typeof d.error === "string" ? d.error : "Не удалось добавить");
      return;
    }
    const data = await res.json();
    onAddedAction({
      uuid: data.data.uuid,
      user: data.data.user ?? {
        uuid: userUuid,
        full_name: null,
        username: null,
        avatar_url: null,
      },
      role: "member",
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-(--bg-card) border border-(--border) rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-(--border)">
          <h3 className="text-sm font-medium text-(--text-primary)">
            Добавить участника
          </h3>
          <button
            type="button"
            onClick={onCloseAction}
            className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-primary) transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 border-b border-(--border)">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Поиск по имени, логину или email…"
            className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showHistory}
              onChange={(e) => setShowHistory(e.target.checked)}
              className="w-4 h-4 rounded border-(--border) accent-(--accent)"
            />
            <span className="text-(--text-secondary)">
              Показать историю сообщений
            </span>
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading && (
            <p className="text-sm text-(--text-muted) text-center py-4">
              Поиск…
            </p>
          )}
          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <p className="text-sm text-(--text-muted) text-center py-4">
              Ничего не найдено
            </p>
          )}
          {!loading && query.trim().length < 2 && (
            <p className="text-sm text-(--text-muted) text-center py-4">
              Введите минимум 2 символа
            </p>
          )}

          {results.map((u) => (
            <button
              key={u.uuid}
              type="button"
              onClick={() => handleAdd(u.uuid)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-(--bg-primary) text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-(--bg-primary) border border-(--border) flex items-center justify-center shrink-0 overflow-hidden">
                {u.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.avatar_url}
                    alt={u.full_name ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-(--text-muted)">
                    {(u.full_name ?? u.username ?? "?")[0]}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-(--text-primary) truncate">
                  {u.full_name ?? u.username ?? "—"}
                </div>
                {u.username && (
                  <div className="text-xs text-(--text-muted) truncate">
                    @{u.username}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Диалог передачи владения ----------
function TransferOwnershipDialog({
  chatUuid,
  toUuid,
  toName,
  onCloseAction,
  onTransferredAction,
}: {
  chatUuid: string;
  toUuid: string;
  toName: string;
  onCloseAction: () => void;
  onTransferredAction: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/chat/chats/${chatUuid}/transfer-ownership`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toUuid }),
        },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(
          typeof d.error === "string"
            ? d.error
            : "Не удалось передать владение",
        );
      }
      onTransferredAction();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-100 p-4">
      <div className="bg-(--bg-card) border border-(--border) rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-(--border)">
          <h3 className="text-base font-medium text-(--text-primary) inline-flex items-center gap-2">
            <Crown size={16} className="text-(--accent)" />
            Передать владение
          </h3>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-(--text-secondary)">
            Новый владелец чата:
            <br />
            <span className="text-(--text-primary) font-medium">{toName}</span>
          </p>

          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-sm text-yellow-200">
            После передачи вы станете <b>администратором</b> и потеряете права
            владельца. Отменить это действие нельзя.
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="p-4 border-t border-(--border) flex justify-end gap-2">
          <button
            type="button"
            onClick={onCloseAction}
            disabled={submitting}
            className="px-4 py-2 rounded-lg border border-(--border) text-(--text-secondary) text-sm hover:bg-(--bg-primary) disabled:opacity-50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-(--accent) text-(--bg-card) text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {submitting ? "Передаю…" : "Передать владение"}
          </button>
        </div>
      </div>
    </div>
  );
}
