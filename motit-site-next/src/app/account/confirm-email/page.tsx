import { Suspense } from "react";
import { ConfirmEmailClient } from "./ConfirmEmailClient";

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto mt-20 p-6">Загрузка…</div>}>
      <ConfirmEmailClient />
    </Suspense>
  );
}