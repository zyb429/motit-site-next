"use client";

import { ThemeProvider } from "next-themes";

export function ThemedProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      scriptProps={{ type: "application/json" } as any}
    >
      {children}
    </ThemeProvider>
  );
}