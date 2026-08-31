import { Headphones } from 'lucide-react';
import NavigationClient from './NavigationClient';
import Link from 'next/link';
import { headers } from 'next/headers';

const navLinks = [
  { label: 'Направления', href: '/#directions' },
  { label: 'О нас', href: '/#about' },
  { label: 'Контакты', href: '/#contact' },
  { label: 'Блог', href: '/blog' },
];

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50">
      <nav className="h-[72px]">
        <div className="content-container h-full flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight transition-colors duration-200 hover:text-[#2dd4bf]"
            style={{ color: '#e0f7fa' }}
          >
            МОТИТ
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium uppercase tracking-wider transition-colors duration-200 hover:text-[#2dd4bf]"
                style={{ color: 'rgba(224, 247, 250, 0.7)' }}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://help.motit.by"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 text-sm font-medium uppercase tracking-wider transition-colors duration-200 hover:text-[#2dd4bf]"
              style={{ color: 'rgba(224, 247, 250, 0.7)' }}
            >
              <Headphones size={14} />
              Поддержка
            </a>
            <Link
              href="/#contact"
              className="btn-primary py-3 px-5 text-xs"
            >
              Связаться
            </Link>
          </div>

          <NavigationClient />
        </div>
      </nav>
    </header>
  );
}