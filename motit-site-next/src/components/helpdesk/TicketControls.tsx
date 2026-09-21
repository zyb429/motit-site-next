// src/components/helpdesk/TicketControls.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
}

export function TicketControls({
  ticketUuid,
  currentStatus,
  currentPriority,
  currentAssigneeUuid,
  statuses,
  priorities,
  agents,
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
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(typeof d.error === "string" ? d.error : "Не удалось сохранить");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="mt-6 p-4 rounded-xl bg-(--bg-card) border border-(--border) grid grid-cols-1 md:grid-cols-3 gap-4">
      <Field label="Статус">
        <select
          value={currentStatus ?? ""}
          disabled={isPending}
          onChange={(e) => patch({ statusCode: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
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
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
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
          disabled={isPending}
          onChange={(e) => patch({ assigneeUuid: e.target.value || null })}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-primary) border border-(--border) text-(--text-primary) focus:border-(--accent) outline-none"
        >
          <option value="">— не назначен —</option>
          {agents.map((a) => (
            <option key={a.uuid} value={a.uuid}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>

      {error && (
        <p className="md:col-span-3 text-red-400 text-sm">{error}</p>
      )}
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
      <label className="block text-xs text-(--text-muted) mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
