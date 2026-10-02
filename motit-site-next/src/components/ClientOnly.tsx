"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const emptySubscribe = () => () => {};

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,   // на клиенте — true
    () => false,  // на сервере — false
  );

  return <>{mounted ? children : fallback}</>;
}
