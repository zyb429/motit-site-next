// src/components/helpdesk/PriorityBadge.tsx
import { priorityLabel } from "@/lib/tickets/labels";

export function PriorityBadge({ code }: { code: string | null | undefined }) {
  const { label, color } = priorityLabel(code);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {label}
    </span>
  );
}
