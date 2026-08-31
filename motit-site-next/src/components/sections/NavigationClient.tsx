'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Headphones, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Направления', href: '/#directions' },
  { label: 'О нас', href: '/#about' },
  { label: 'Контакты', href: '/#contact' },
  { label: 'Блог', href: '/blog' },
];

export default function NavigationClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Функция для обработки клика по якорным ссылкам
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    // Если это якорь на главной
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      
      // Если мы на главной - просто скроллим
      if (pathname === '/') {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Если на другой странице - переходим на главную с якорем
        window.location.href = href;
      }
    } else {
      // Обычная ссылка
      window.location.href = href;
    }
  };

  return (
    <>
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(10, 25, 32, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(45, 212, 191, 0.1)' : '1px solid transparent',
          zIndex: -1,
        }}
      />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-white/5"
        aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={isOpen}
        style={{ color: '#e0f7fa' }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          style={{ zIndex: 40 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 bottom-0 w-[280px] bg-[#0a1920] transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 50 }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <span className="text-lg font-bold" style={{ color: '#e0f7fa' }}>МЕНЮ</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg transition-colors duration-200 hover:bg-white/5"
              aria-label="Закрыть меню"
              style={{ color: '#e0f7fa' }}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-5">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-white/5 hover:text-[#2dd4bf]"
                  style={{ color: '#e0f7fa' }}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://help.motit.by"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-white/5 hover:text-[#2dd4bf]"
                style={{ color: '#e0f7fa' }}
              >
                <Headphones size={16} />
                Поддержка
              </a>
            </div>
          </nav>

          <div className="p-5 border-t border-white/5 space-y-2">
            <a
              href="tel:+375291185082"
              className="flex items-center gap-2 text-sm transition-colors hover:text-[#2dd4bf]"
              style={{ color: 'rgba(128, 222, 234, 0.8)' }}
            >
              <Phone size={14} style={{ color: '#2dd4bf' }} />
              +375 (29) 118-50-82
            </a>
            <a
              href="mailto:info@motit.by"
              className="flex items-center gap-2 text-sm transition-colors hover:text-[#2dd4bf]"
              style={{ color: 'rgba(128, 222, 234, 0.8)' }}
            >
              <Mail size={14} style={{ color: '#2dd4bf' }} />
              info@motit.by
            </a>
            <Link
              href="/#contact"
              onClick={(e) => handleNavClick(e, '/#contact')}
              className="btn-primary w-full mt-3 block text-center"
            >
              Связаться
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}