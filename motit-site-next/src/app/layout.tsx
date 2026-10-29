// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import { Providers } from "./providers";
import { getSiteSettings } from "@/lib/db/site-settings";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let s: Awaited<ReturnType<typeof getSiteSettings>> | null = null;
  try {
    s = await getSiteSettings();
  } catch {
    // если SiteSettings ещё не создан (первый запуск) — не падаем
  }

  const siteName = s?.siteName ?? "Motit";
  const description =
    s?.seoDescription ?? s?.description ?? "Комплексные IT-услуги";
  const keywords = s?.seoKeywords ?? "IT, информационная безопасность, пентест, аудит";
  const ogImage = s?.ogImageUrl ?? "/og-image.jpg";
  const robots = s?.robots ?? "index,follow";

  const robotsParts = robots.split(",").map((r) => r.trim());
  const isIndex = robotsParts.includes("index");
  const isFollow = robotsParts.includes("follow");

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://motit.by",
    ),
    title: {
      default: s?.seoTitle ?? `${siteName} — IT-решения для бизнеса`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
    authors: [{ name: siteName, url: "https://motit.by" }],
    openGraph: {
      title: s?.seoTitle ?? `${siteName} — IT-решения для бизнеса`,
      description,
      url: "https://motit.by",
      siteName,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: "ru_RU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: s?.seoTitle ?? `${siteName} — IT-решения для бизнеса`,
      description,
      images: [ogImage],
    },
    robots: {
      index: isIndex,
      follow: isFollow,
      googleBot: {
        index: isIndex,
        follow: isFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: "https://motit.by",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className={`scroll-smooth ${inter.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}