'use client';

import { useEffect, useRef } from 'react';
import { Headphones, Shield, ClipboardCheck, Bug, Home, Code, Globe, Activity, ShieldCheck, ShoppingCart } from 'lucide-react';

const ICONS = { headphones: Headphones, shield: Shield, clipboard: ClipboardCheck, bug: Bug, home: Home, code: Code, globe: Globe, activity: Activity, shieldcheck: ShieldCheck, cart: ShoppingCart } as const;

export type DirectionsProps = {
  label: string;
  title: string;
  subtitle: string;
  items: Array<{ icon: string; title: string; description: string }>;
};

export default function Directions({ label, title, subtitle, items }: DirectionsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (typeof document !== 'undefined' && document.querySelector('.Puck')) return;

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    section.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const renderItems = () => {
    const safeItems = items ?? [];
    const total = safeItems.length;
    const result: React.ReactNode[] = [];

    const itemsInLastRow = total % 3;
    const needsSpacerBefore = itemsInLastRow === 1;

    for (let i = 0; i < total; i++) {
      if (needsSpacerBefore && i === total - 1) {
        result.push(
          <div 
            key="spacer-before-last" 
            className="hidden lg:block pointer-events-none" 
            aria-hidden="true" 
          />
        );
      }

      const item = safeItems[i];
      const Icon = (ICONS as any)[item.icon] ?? Headphones;

      result.push(
        <div 
          key={`item-${i}`} 
          className="PuckVisibilityFix group cursor-pointer rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full w-full" 
          style={{ 
            backgroundColor: 'var(--bg-card, #0f2832)', 
            border: '1px solid var(--border, rgba(45, 212, 191, 0.1))',
          }}
        >
          {/* Верхний блок с заголовком и иконкой */}
          <div className="flex justify-between items-stretch gap-4 mb-4">
            {/* 
              Добавили flex и items-center к самому заголовку. 
              Теперь текст будет центрироваться по вертикали внутри 
              зарезервированного пространства min-h.
            */}
            <h3 
              className="font-semibold text-lg md:text-xl leading-snug flex-1 min-h-[3.25rem] md:min-h-[3.5rem] line-clamp-2 flex items-center" 
              style={{ color: 'var(--text-primary, #e0f7fa)' }}
            >
              {/* Оборачиваем текст в span, чтобы line-clamp работал корректно внутри flex-контейнера */}
              <span className="line-clamp-2">{item.title}</span>
            </h3>
            
            <div 
              // Убрали mt-0.5, так как родитель теперь items-stretch, 
              // и иконка растянется на высоту заголовка. 
              // items-center внутри центрирует саму иконку в этом блоке.
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0" 
              style={{ backgroundColor: 'var(--accent-dim, rgba(45, 212, 191, 0.12))' }}
            >
              <Icon size={20} className="md:hidden" style={{ color: 'var(--accent, #2dd4bf)' }} />
              <Icon size={24} className="hidden md:block" style={{ color: 'var(--accent, #2dd4bf)' }} />
            </div>
          </div>
          
          {/* Описание */}
          <p 
            className="text-sm md:text-base leading-relaxed flex-grow" 
            style={{ color: 'var(--text-secondary, #80deea)' }}
          >
            {item.description}
          </p>
        </div>
      );
    }

    return result;
  };

  return (
    <section id="directions" className="section-padding" style={{ backgroundColor: 'var(--bg-primary, #0a1920)' }}>
      <div className="content-container">
        <div className="mb-10 md:mb-14">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4">{title}</h2>
          <p className="section-subtitle max-w-160">{subtitle}</p>
        </div>
        
        <div 
          ref={sectionRef} 
          className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {renderItems()}
        </div>
      </div>
    </section>
  );
}