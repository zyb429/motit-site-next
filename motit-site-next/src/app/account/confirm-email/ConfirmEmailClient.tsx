// src/app/account/confirm-email/ConfirmEmailClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

export function ConfirmEmailClient() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "idle" });
  const started = useRef(false); // ← защита от двойного вызова в StrictMode

  useEffect(() => {
    if (!token) {
      setState({ kind: "error", message: "Токен не передан" });
      return;
    }
    if (started.current) return;
    started.current = true;

    setState({ kind: "loading" });

    fetch("/api/account/email/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setState({
            kind: "error",
            message: data.error ?? "Не удалось подтвердить email",
          });
          return;
        }
        setState({ kind: "ok" });
      })
      .catch(() => {
        setState({ kind: "error", message: "Ошибка сети" });
      });
  }, [token]);

  if (state.kind === "loading") {
    return <Result ok={true} message="Подтверждаем email…" />;
  }
  if (state.kind === "ok") {
    return <Result ok={true} message="Email успешно изменён" />;
  }
  if (state.kind === "error") {
    return <Result ok={false} message={state.message} />;
  }
  return <Result ok={true} message="Подготавливаем…" />;
}

function Result({ ok, message }: { ok: boolean; message: string }) {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 rounded-lg border border-(--border) bg-(--bg-card)">
      <h1 className={`text-lg font-medium mb-2 ${ok ? "text-(--accent)" : "text-red-400"}`}>
        {ok ? "Готово" : "Ошибка"}
      </h1>
      <p className="text-sm text-(--text-secondary) mb-4">{message}</p>
      <Link href="/cabinet/profile" className="text-sm text-(--accent) hover:underline">
        Вернуться в профиль
      </Link>
    </div>
  );
}