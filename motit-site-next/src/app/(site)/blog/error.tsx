"use client";

import { useEffect } from "react";
import { Container, Button } from "@/components/ui";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 text-center">
      <h2 className="text-2xl font-bold mb-4 text-(--text-primary)">
        Что-то пошло не так
      </h2>
      <p className="text-(--text-secondary) mb-6">
        Не удалось загрузить блог. Пожалуйста, попробуйте позже.
      </p>
      {error.digest && (
        <p className="text-xs text-(--text-muted) mb-4">
          Код ошибки: <code>{error.digest}</code>
        </p>
      )}
      <Button onClick={reset}>Попробовать снова</Button>
    </Container>
  );
}