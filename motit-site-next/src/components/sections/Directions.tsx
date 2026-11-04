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
          className="PuckVisibilityFix group cursor-pointer rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full w-full bg-(--bg-card) border border-(--border)"
        >
          {/* Верхний блок с заголовком и иконкой */}
          <div className="flex justify-between items-stretch gap-4 mb-4">
            <h3 
              className="font-semibold text-lg md:text-xl leading-snug flex-1 min-h-[3.25rem] md:min-h-[3.5rem] line-clamp-2 flex items-center text-(--text-primary)"
            >
              <span className="line-clamp-2">{item.title}</span>
            </h3>
            
            <div 
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 bg-(--accent-dim)"
            >
              <Icon size={20} className="md:hidden text-(--accent)" />
              <Icon size={24} className="hidden md:block text-(--accent)" />
            </div>
          </div>
          
          {/* Описание */}
          <p 
            className="text-sm md:text-base leading-relaxed flex-grow text-(--text-secondary)"
          >
            {item.description}
          </p>
        </div>
      );
    }

    return result;
  };

  return (
    <section id="directions" className="section-padding bg-(--bg-primary) transition-colors duration-300">
      <div className="content-container">
        <div className="mb-10 md:mb-14">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4 text-(--text-primary)">{title}</h2>
          <p className="section-subtitle max-w-160 text-(--text-secondary)">{subtitle}</p>
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