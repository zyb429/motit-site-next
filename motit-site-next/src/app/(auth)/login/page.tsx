// src/app/(auth)/login/page.tsx
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1920]" />}>
      <LoginForm />
    </Suspense>
  );
}
