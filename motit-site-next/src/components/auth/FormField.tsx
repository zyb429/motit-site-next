// src/components/auth/FormField.tsx
import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export function FormField({ label, id, ...inputProps }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300 mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="w-full px-4 py-2.5 rounded-lg bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-[#e0f7fa] placeholder:text-gray-600 text-sm focus:border-[#2dd4bf] focus:outline-none transition-colors disabled:opacity-50"
      />
    </div>
  );
}
