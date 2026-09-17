"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");

  function zoneForRole(role: string | undefined): string {
    const r = (role ?? "").toLowerCase();
    if (r === "admin" || r === "worker") return "/admin";
    if (r === "statistics") return "/stats";
    if (r === "client" || r === "authenticated") return "/account";
    return "/account";
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        const role = data?.user?.role?.name ?? data?.user?.role?.type;
        const zone = zoneForRole(role);
        const target = from && from.startsWith(zone) ? from : zone;
        router.push(target);
      } catch {
        // не авторизован — остаёмся на форме
      }
    };
    checkAuth();
  }, [router, from]);

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Ошибка входа");
      }

      setSuccessMessage("Вход выполнен успешно!");

      const role = data?.user?.role;
      const zone = zoneForRole(role);
      const target =
        from && from.startsWith(zone) ? from : data?.redirectTo || zone;

      setTimeout(() => {
        router.push(target);
        router.refresh();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1920] p-4">
      <div className="w-full max-w-md p-8 bg-[#0f2832] rounded-2xl border border-[rgba(45,212,191,0.08)] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#e0f7fa]">
            Добро пожаловать
          </h1>
          <p className="text-gray-400 mt-2">Войдите в свою учетную запись</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Email или имя пользователя
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-[#e0f7fa] placeholder:text-gray-600 text-sm focus:border-[#2dd4bf] focus:outline-none transition-colors disabled:opacity-50"
              placeholder="admin@example.com"
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0d2029] border border-[rgba(45,212,191,0.08)] text-[#e0f7fa] placeholder:text-gray-600 text-sm focus:border-[#2dd4bf] focus:outline-none transition-colors disabled:opacity-50"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 rounded-lg text-[#2dd4bf] text-sm">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#2dd4bf] text-[#0a1920] rounded-lg font-medium hover:bg-[#14b8a6] focus:ring-4 focus:ring-[#2dd4bf]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Вход...
              </span>
            ) : (
              "Войти"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <span>Нет аккаунта? </span>
          <Link
            href="/register"
            className="text-[#2dd4bf] hover:text-[#14b8a6] hover:underline"
          >
            Зарегистрироваться
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 text-center text-xs text-gray-600">
            🔧 Режим разработки
          </div>
        )}
      </div>
    </div>
  );
}
