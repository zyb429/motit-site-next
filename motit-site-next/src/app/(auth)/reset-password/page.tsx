// src/app/(auth)/reset-password/page.tsx
"use client";

import { useState, type SyntheticEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormAlert } from "@/components/auth/FormAlert";
import { PasswordInput } from "@/components/ui/PasswordInput";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Отсутствует токен. Запросите новую ссылку.");
      return;
    }

    if (password.length < 8) {
      setError("Пароль должен быть не короче 8 символов");
      return;
    }

    if (password !== password2) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Ошибка сброса");
      }

      setSuccess("Пароль успешно изменён. Перенаправляем на вход...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сброса");
      setLoading(false);
    }
  };

  const passwordInputClass =
    "w-full px-4 py-2.5 pr-10 rounded-lg bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-[#e0f7fa] placeholder:text-gray-600 text-sm focus:border-[#2dd4bf] focus:outline-none transition-colors disabled:opacity-50";

  const passwordButtonClass =
    "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-500 hover:text-[#2dd4bf] transition-colors disabled:opacity-50";

  return (
    <AuthCard
      title="Новый пароль"
      subtitle="Придумайте новый пароль для вашего аккаунта"
      footer={
        <Link
          href="/login"
          className="text-[#2dd4bf] hover:text-[#14b8a6] hover:underline"
        >
          Вернуться ко входу
        </Link>
      }
    >
      {!token ? (
        <FormAlert variant="error">
          Ссылка недействительна.{" "}
          <Link href="/forgot-password" className="underline">
            Запросите новую
          </Link>
          .
        </FormAlert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Новый пароль
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Минимум 8 символов"
              minLength={8}
              inputClassName={passwordInputClass}
              buttonClassName={passwordButtonClass}
            />
          </div>

          <div>
            <label
              htmlFor="password2"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Повторите пароль
            </label>
            <PasswordInput
              id="password2"
              value={password2}
              onChange={setPassword2}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Повторите пароль"
              inputClassName={passwordInputClass}
              buttonClassName={passwordButtonClass}
            />
          </div>

          {error && <FormAlert variant="error">{error}</FormAlert>}
          {success && <FormAlert variant="success">{success}</FormAlert>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#2dd4bf] text-[#0a1920] rounded-lg font-medium hover:bg-[#14b8a6] focus:ring-4 focus:ring-[#2dd4bf]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Сохранение..." : "Сохранить пароль"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1920]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
