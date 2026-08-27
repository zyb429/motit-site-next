'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Container } from '@/components/ui';
import { Navigation } from './Navigation';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm'
          : 'bg-transparent'
      }`}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Motit
          </Link>
          <Navigation />
        </div>
      </Container>
    </header>
  );
}