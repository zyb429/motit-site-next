// src/components/helpdesk/StatusBadge.tsx
import { statusLabel } from "@/lib/tickets/labels";

export function StatusBadge({ code }: { code: string | null | undefined }) {
  const { label, color } = statusLabel(code);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap border"
      style={{
        backgroundColor: `${color}1a`,
        color,
        borderColor: `${color}33`,
      }}
    >
      {label}
    </span>
  );
}