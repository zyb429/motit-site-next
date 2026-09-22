// src/components/auth/FormAlert.tsx
import type { ReactNode } from "react";

type AlertVariant = "error" | "success";

interface FormAlertProps {
  variant: AlertVariant;
  children: ReactNode;
}

const styles: Record<AlertVariant, string> = {
  error:
    "p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm",
  success:
    "p-3 bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 rounded-lg text-[#2dd4bf] text-sm",
};

export function FormAlert({ variant, children }: FormAlertProps) {
  return <div className={styles[variant]}>{children}</div>;
}
