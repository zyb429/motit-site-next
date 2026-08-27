'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui';

const links = [
  { href: '/', label: 'Главная' },
  { href: '/blog', label: 'Блог' },
  { href: '/about', label: 'О нас' },
  { href: '/contact', label: 'Контакты' },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/blog' && pathname?.startsWith('/blog')) {
      return true;
    }
    return pathname === path;
  };

  return (
    <>
      {/* Десктопная навигация */}
      <nav className="hidden md:flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              isActive(link.href)
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Мобильное меню */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileMenuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Мобильное меню (выпадающее) */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 md:hidden z-50">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(link.href)
                    ? 'text-blue-600'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}