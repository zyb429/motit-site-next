"use client";

import type { CustomField } from "@puckeditor/core";

export const dateField: CustomField<string> = {
  type: "custom",
  label: "Дата",
  render: ({ value, onChange }) => (
    <div className="space-y-1">
      <input
        type="date"
        className="w-full rounded border p-2 text-sm"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <p className="text-xs text-gray-500">
          {new Date(value).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  ),
};