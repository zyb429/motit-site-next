import { useState, useEffect } from 'react';
import { Menu, X, Headphones } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsOpen(false);
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Направления', target: 'directions' },
    { label: 'О нас', target: 'about' },
    { label: 'Контакты', target: 'contact' },
  ];

  return (
    <>
      <nav
        className={`nav-container fixed top-0 left-0 right-0 z-[1000] transition-all duration-200 ${scrolled ? 'backdrop-blur-[16px] border-b' : 'bg-transparent'}`}
        style={{
          height: 72,
          backgroundColor: scrolled ? 'rgba(10, 25, 32, 0.92)' : 'transparent',
          borderColor: scrolled ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
        }}
      >
        <div className="content-container h-full flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="text-xl font-bold tracking-tight transition-colors duration-100 hover:text-[#2dd4bf]"
            style={{ color: '#e0f7fa' }}
          >
            МОТИТ
          </a>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.target}
                href={`#${link.target}`}
                onClick={(e) => handleNavClick(e, link.target)}
                className="text-sm font-medium uppercase tracking-[0.05em] transition-colors duration-100 hover:text-[#2dd4bf]"
                style={{ color: 'rgba(224, 247, 250, 0.7)' }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://help.motit.by"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 text-sm font-medium uppercase tracking-[0.05em] transition-colors duration-100 hover:text-[#2dd4bf]"
              style={{ color: 'rgba(224, 247, 250, 0.7)' }}
            >
              <Headphones size={14} />
              Поддержка
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, 'contact')}
              className="btn-primary py-3 px-5 text-xs"
            >
              Связаться
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 transition-colors duration-100 hover:text-[#2dd4bf]"
            style={{ color: '#e0f7fa' }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[999] transition-all duration-300 md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        style={{ backgroundColor: '#0a1920' }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, i) => (
            <a
              key={link.target}
              href={`#${link.target}`}
              onClick={(e) => handleNavClick(e, link.target)}
              className="text-2xl font-bold uppercase tracking-tight transition-colors duration-100 hover:text-[#2dd4bf]"
              style={{
                color: '#e0f7fa',
                transitionDelay: isOpen ? `${i * 0.06}s` : '0s',
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.25s ease-out',
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://help.motit.by"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-2xl font-bold uppercase tracking-tight transition-colors duration-100 hover:text-[#2dd4bf]"
            style={{
              color: '#e0f7fa',
              transitionDelay: isOpen ? '0.18s' : '0s',
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.25s ease-out',
            }}
          >
            <Headphones size={22} />
            Поддержка
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, 'contact')}
            className="btn-primary mt-4"
            style={{
              transitionDelay: isOpen ? '0.24s' : '0s',
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.25s ease-out',
            }}
          >
            Связаться
          </a>
        </div>
      </div>
    </>
  );
}
