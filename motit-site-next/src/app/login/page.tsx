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

  // Получаем URL для редиректа после входа
  const from = searchParams.get("from") || "/admin";

  // Проверяем, не авторизован ли уже пользователь
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          router.push(from);
        }
      } catch {
        // Игнорируем ошибки - пользователь не авторизован
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

    // ✅ Валидация на клиенте
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Ошибка входа");
      }

      // ✅ Показываем успешное сообщение
      setSuccessMessage("Вход выполнен успешно!");

      // ✅ Редирект с небольшой задержкой для показа сообщения
      setTimeout(() => {
        router.push(from);
        router.refresh();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать</h1>
          <p className="text-gray-500 mt-2">Войдите в свою учетную запись</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email или Имя пользователя
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100"
              placeholder="admin@example.com"
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
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

        <div className="mt-6 text-center text-sm text-gray-500">
          <span>Нет аккаунта? </span>
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Зарегистрироваться
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          {process.env.NODE_ENV === "development" && (
            <span>🔧 Режим разработки</span>
          )}
        </div>
      </div>
    </div>
  );
}
