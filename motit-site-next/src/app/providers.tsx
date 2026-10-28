"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

// next-themes внедряет inline-скрипт для предотвращения FOUC, React 19 ошибочно выдаёт предупреждение
// Официальный обходной путь shadcn/ui: https://github.com/shadcn-ui/ui/issues/10104
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Encountered a script tag") ||
        // Фильтруем предупреждения о key из внутренних компонентов Puck
        args[0].includes('Each child in a list should have a unique "key" prop'))
    ) {
      return;
    }
    orig.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
          mutations: { retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}