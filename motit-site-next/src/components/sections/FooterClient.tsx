'use client';

export default function FooterClient() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#e0f7fa' }}>Навигация</h4>
      <div className="flex flex-col gap-3">
        {[
          { label: 'Направления', target: 'directions' },
          { label: 'О нас', target: 'about' },
          { label: 'Контакты', target: 'contact' },
          { label: 'FAQ', target: 'faq' },
        ].map((link) => (
          <a
            key={link.target}
            href={`#${link.target}`}
            onClick={(e) => handleNavClick(e, link.target)}
            className="text-sm transition-colors duration-100 hover:text-[#2dd4bf]"
            style={{ color: 'rgba(128, 222, 234, 0.6)' }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}