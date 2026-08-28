import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import DraftModeIndicator from '@/components/DraftModeIndicator';
import Navigation from '@/components/sections/Navigation'

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Motit Site',
  description: 'Motit official website',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>
          <Navigation />
            <main className="min-h-screen">
              {children}
            </main>
          <DraftModeIndicator />
        </Providers>
      </body>
    </html>
  );
}