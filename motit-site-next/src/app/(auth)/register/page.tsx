// src/app/(auth)/register/page.tsx
"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { FormAlert } from "@/components/auth/FormAlert";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Ошибка регистрации");
      }

      setSuccess("Аккаунт создан! Перенаправляем на вход...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка регистрации");
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Регистрация"
      subtitle="Создайте новый аккаунт"
      footer={
        <>
          <span>Уже есть аккаунт? </span>
          <Link
            href="/login"
            className="text-[#2dd4bf] hover:text-[#14b8a6] hover:underline"
          >
            Войти
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="username"
          label="Username"
          type="text"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          minLength={3}
          disabled={loading}
          placeholder="myusername"
          autoComplete="username"
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          disabled={loading}
          placeholder="user@example.com"
          autoComplete="email"
        />

        <FormField
          id="full_name"
          label="Полное имя (необязательно)"
          type="text"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          disabled={loading}
          placeholder="Иван Иванов"
          autoComplete="name"
        />

        <FormField
          id="phone"
          label="Телефон"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
          pattern="^\+?[0-9\s\-()]{7,20}$"
          title="Введите корректный номер"
          disabled={loading}
          placeholder="+375 (29) 123-45-67"
          autoComplete="tel"
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
            autoComplete="new-password"
            placeholder="Минимум 8 символов"
            minLength={8}
            inputClassName="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-[#e0f7fa] placeholder:text-gray-600 text-sm focus:border-[#2dd4bf] focus:outline-none transition-colors disabled:opacity-50"
            buttonClassName="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-500 hover:text-[#2dd4bf] transition-colors disabled:opacity-50"
          />
        </div>

        {error && <FormAlert variant="error">{error}</FormAlert>}
        {success && <FormAlert variant="success">{success}</FormAlert>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#2dd4bf] text-[#0a1920] rounded-lg font-medium hover:bg-[#14b8a6] focus:ring-4 focus:ring-[#2dd4bf]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Создание..." : "Зарегистрироваться"}
        </button>
      </form>
    </AuthCard>
  );
}
