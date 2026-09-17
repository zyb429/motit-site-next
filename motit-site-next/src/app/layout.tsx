// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "Motit — IT-решения для бизнеса",
    template: "%s | Motit",
  },
  description: "Комплексные IT-услуги: аудит, мониторинг, безопасность",
  keywords: "IT, информационная безопасность, пентест, аудит",
  authors: [{ name: "Motit", url: "https://motit.by" }],
  openGraph: {
    title: "Motit — IT-решения для бизнеса",
    description: "Комплексные IT-услуги",
    url: "https://motit.by",
    siteName: "Motit",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Motit — IT-решения для бизнеса",
    description: "Комплексные IT-услуги",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://motit.by",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var path = window.location.pathname;
                  // Тёмная тема для всех зон, КРОМЕ /admin
                  var isAdmin = path.startsWith("/admin");
                  if (!isAdmin) {
                    document.documentElement.classList.add("dark");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
