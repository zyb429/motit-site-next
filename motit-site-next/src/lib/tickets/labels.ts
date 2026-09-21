// src/lib/tickets/labels.ts
export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN:           { label: "Открыт",       color: "#2dd4bf" },
  IN_PROGRESS:    { label: "В работе",     color: "#f59e0b" },
  WAITING_CLIENT: { label: "Ждём клиента", color: "#60a5fa" },
  RESOLVED:       { label: "Решён",        color: "#22c55e" },
  CLOSED:         { label: "Закрыт",       color: "#6b7280" },
};

export const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  LOW:    { label: "Низкий",  color: "#6b7280" },
  NORMAL: { label: "Обычный", color: "#2dd4bf" },
  HIGH:   { label: "Высокий", color: "#f59e0b" },
  URGENT: { label: "Срочный", color: "#ef4444" },
};

export function statusLabel(code: string | null | undefined) {
  if (!code) return { label: "—", color: "#6b7280" };
  return STATUS_LABELS[code] ?? { label: code, color: "#6b7280" };
}

export function priorityLabel(code: string | null | undefined) {
  if (!code) return { label: "—", color: "#6b7280" };
  return PRIORITY_LABELS[code] ?? { label: code, color: "#6b7280" };
}
