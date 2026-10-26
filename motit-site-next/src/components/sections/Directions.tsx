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

  return (
    <section id="directions" className="section-padding" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container">
        <div className="mb-12 md:mb-16">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4">{title}</h2>
          <p className="section-subtitle max-w-160">{subtitle}</p>
        </div>
        <div ref={sectionRef} className="flex flex-wrap gap-4 md:gap-5 justify-center">
          {(items ?? []).map((item, index) => {
            const Icon = (ICONS as any)[item.icon] ?? Headphones;
            return (
              <div key={index} className={`reveal reveal-d${Math.min(index + 1, 9)} group cursor-pointer rounded-2xl p-5 md:p-6 transition-all duration-150 hover:-translate-y-1.5 w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] xl:w-[calc(20%-16px)]`} style={{ backgroundColor: '#0f2832', border: '1px solid rgba(45, 212, 191, 0.08)', minHeight: '200px', opacity: 1 }}>
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(45, 212, 191, 0.12)' }}>
                  <Icon size={22} style={{ color: '#2dd4bf' }} />
                </div>
                <h3 className="font-semibold text-base md:text-lg leading-snug mb-2" style={{ color: '#e0f7fa' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.65)' }}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}