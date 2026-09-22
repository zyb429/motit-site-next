// src/components/auth/AuthCard.tsx
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1920] p-4">
      <div className="w-full max-w-md p-8 bg-[#0f2832] rounded-2xl border border-[rgba(45,212,191,0.08)] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#e0f7fa]">{title}</h1>
          {subtitle && <p className="text-gray-400 mt-2">{subtitle}</p>}
        </div>

        {children}

        {footer && (
          <div className="mt-6 text-center text-sm text-gray-400">{footer}</div>
        )}
      </div>
    </div>
  );
}
