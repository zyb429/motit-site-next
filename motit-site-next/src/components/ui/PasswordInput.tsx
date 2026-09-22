// src/components/ui/PasswordInput.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  minLength?: number;
  id?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete = "current-password",
  minLength,
  id,
  className = "",
  inputClassName,
  buttonClassName,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  const baseInputClass =
    inputClassName ??
    "w-full px-3 py-2 pr-10 bg-(--bg-secondary) border border-(--border) rounded-lg text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none disabled:opacity-50";

  const baseButtonClass =
    buttonClassName ??
    "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-card) transition-colors disabled:opacity-50";

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        minLength={minLength}
        className={baseInputClass}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        disabled={disabled}
        title={show ? "Скрыть пароль" : "Показать пароль"}
        aria-label={show ? "Скрыть пароль" : "Показать пароль"}
        className={baseButtonClass}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
