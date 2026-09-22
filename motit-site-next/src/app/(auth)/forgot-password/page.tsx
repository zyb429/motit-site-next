// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { FormAlert } from "@/components/auth/FormAlert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Ошибка отправки");
      }

      setSuccess(
        "Если такой email зарегистрирован — мы отправили ссылку для сброса пароля. Проверьте почту.",
      );
      setEmail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Забыли пароль?"
      subtitle="Введите email — пришлём ссылку для сброса"
      footer={
        <Link
          href="/login"
          className="text-[#2dd4bf] hover:text-[#14b8a6] hover:underline"
        >
          Вернуться ко входу
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          placeholder="user@example.com"
          autoComplete="email"
        />

        {error && <FormAlert variant="error">{error}</FormAlert>}
        {success && <FormAlert variant="success">{success}</FormAlert>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#2dd4bf] text-[#0a1920] rounded-lg font-medium hover:bg-[#14b8a6] focus:ring-4 focus:ring-[#2dd4bf]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Отправка..." : "Отправить ссылку"}
        </button>
      </form>
    </AuthCard>
  );
}
