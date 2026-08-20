import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Удалите import "./App.css"; — он не нужен

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "МОТИТ - IT-решения для бизнеса",
  description: "Комплексные IT-решения для бизнеса",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}