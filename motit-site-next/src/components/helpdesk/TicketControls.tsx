// src/components/helpdesk/TicketControls.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Option {
  code: string;
  name: string;
}

interface Agent {
  uuid: string;
  name: string;
}

interface Props {
  ticketUuid: string;
  currentStatus: string | null;
  currentPriority: string | null;
  currentAssigneeUuid: string | null;
  statuses: Option[];
  priorities: Option[];
  agents: Agent[];
  canAssign?: boolean;
}

export function TicketControls({
  ticketUuid,
  currentStatus,
  currentPriority,
  currentAssigneeUuid,
  statuses,
  priorities,
  agents,
  canAssign = true,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function patch(data: Record<string, unknown>) {
    setError(null);
    const res = await fetch(`/api/tickets/${ticketUuid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.status === 403) {
      const d = await res.json().catch(() => ({}));
      setError(
        typeof d.error === "string"
          ? d.error
          : "Недостаточно прав для этого действия",
      );
      return;
    }

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(typeof d.error === "string" ? d.error : "Не удалось сохранить");
      return;
    }

    startTransition(() => router.refresh());
  }

  const selectClass =
    "w-full px-3.5 py-2.5 rounded-xl bg-(--bg-secondary) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) focus:ring-2 focus:ring-(--accent-dim) outline-none transition-all disabled:opacity-50";

  return (
    <div className="mt-6 p-5 rounded-xl bg-(--bg-card) border border-(--border) grid grid-cols-1 md:grid-cols-3 gap-4">
      <Field label="Статус">
        <select
          value={currentStatus ?? ""}
          disabled={isPending}
          onChange={(e) => patch({ statusCode: e.target.value })}
          className={selectClass}
        >
          {statuses.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Приоритет">
        <select
          value={currentPriority ?? ""}
          disabled={isPending}
          onChange={(e) => patch({ priorityCode: e.target.value })}
          className={selectClass}
        >
          {priorities.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Исполнитель">
        <select
          value={currentAssigneeUuid ?? ""}
          disabled={isPending || !canAssign}
          onChange={(e) => patch({ assigneeUuid: e.target.value || null })}
          title={!canAssign ? "Только администратор может менять исполнителя" : undefined}
          className={selectClass}
        >
          <option value="">— не назначен —</option>
          {agents.map((a) => (
            <option key={a.uuid} value={a.uuid}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>

      {isPending && (
        <div className="md:col-span-3 flex items-center gap-2 text-xs text-(--text-muted)">
          <Loader2 size={12} className="animate-spin" /> Сохранение…
        </div>
      )}
      {error && <p className="md:col-span-3 text-red-400 text-sm">{error}</p>}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}