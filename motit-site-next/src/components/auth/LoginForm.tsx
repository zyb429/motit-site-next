// src/components/auth/LoginForm.tsx
"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { AuthCard } from "./AuthCard";
import { FormField } from "./FormField";
import { FormAlert } from "./FormAlert";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");

  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!identifier.trim()) {
      setError("Введите email или имя пользователя");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Введите пароль");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        identifier: identifier.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (!res || res.error) {
        throw new Error("Неверный логин или пароль");
      }

      // Получаем сессию, чтобы узнать роль
      const session = await getSession();
      const role = session?.user?.role ?? null;

      setSuccessMessage("Вход выполнен успешно!");

      // Если есть from — уважаем его, но только если он соответствует роли
      let target: string;
      if (from && from.startsWith("/") && !from.startsWith("//")) {
        target = from;
      } else if (role === "admin") {
        target = "/admin";
      } else if (role === "worker") {
        target = "/worker";
      } else {
        target = "/cabinet";
      }

      router.refresh();
      router.push(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Добро пожаловать"
      subtitle="Войдите в свою учетную запись"
      footer={
        <>
          <span>Нет аккаунта? </span>
          <Link
            href="/register"
            className="text-[#2dd4bf] hover:text-[#14b8a6] hover:underline"
          >
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="identifier"
          label="Email или имя пользователя"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          disabled={loading}
          placeholder="admin@example.com"
          autoComplete="username"
        />

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Пароль
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            disabled={loading}
            autoComplete="current-password"
            placeholder="••••••••"
            inputClassName="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-[#e0f7fa] placeholder:text-gray-600 text-sm focus:border-[#2dd4bf] focus:outline-none transition-colors disabled:opacity-50"
            buttonClassName="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-500 hover:text-[#2dd4bf] transition-colors disabled:opacity-50"
          />
        </div>

        {error && <FormAlert variant="error">{error}</FormAlert>}
        {successMessage && (
          <FormAlert variant="success">{successMessage}</FormAlert>
        )}

        <div className="text-right text-sm">
          <Link
            href="/forgot-password"
            className="text-[#2dd4bf] hover:text-[#14b8a6] hover:underline"
          >
            Забыли пароль?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#2dd4bf] text-[#0a1920] rounded-lg font-medium hover:bg-[#14b8a6] focus:ring-4 focus:ring-[#2dd4bf]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </AuthCard>
  );
}
