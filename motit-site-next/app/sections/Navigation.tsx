import { Headphones } from 'lucide-react';
import NavigationClient from './NavigationClient';

const navLinks = [
  { label: 'Направления', target: 'directions' },
  { label: 'О нас', target: 'about' },
  { label: 'Контакты', target: 'contact' },
];

export default function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="h-[72px]">
        <div className="content-container h-full flex items-center justify-between">
          {/* Логотип */}
          <a
            href="#"
            className="text-xl font-bold tracking-tight transition-colors duration-200 hover:text-[#2dd4bf]"
            style={{ color: '#e0f7fa' }}
          >
            МОТИТ
          </a>

          {/* Десктопная навигация */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.target}
                href={`#${link.target}`}
                className="text-sm font-medium uppercase tracking-wider transition-colors duration-200 hover:text-[#2dd4bf]"
                style={{ color: 'rgba(224, 247, 250, 0.7)' }}
              >
                {link.label}
              </a>
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
            <a
              href="#contact"
              className="btn-primary py-3 px-5 text-xs"
            >
              Связаться
            </a>
          </div>

          {/* Мобильное меню */}
          <NavigationClient />
        </div>
      </nav>
    </header>
  );
}