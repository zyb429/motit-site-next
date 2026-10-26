'use client';

import { useEffect, useRef } from 'react';
import { Users, Target, Cpu, Clock, Headphones, Award } from 'lucide-react';

const ICONS = { users: Users, target: Target, cpu: Cpu, clock: Clock, headphones: Headphones, award: Award } as const;

export type AdvantagesProps = {
  label: string;
  title: string;
  subtitle: string;
  items: Array<{ icon: string; title: string; description: string }>;
};

export default function Advantages({ label, title, subtitle, items }: AdvantagesProps) {
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
    <section className="section-padding" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container">
        <div className="mb-12 md:mb-16">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4">{title}</h2>
          <p className="section-subtitle max-w-[600px]">{subtitle}</p>
        </div>
        <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {(items ?? []).map((item, index) => {
            const Icon = (ICONS as any)[item.icon] ?? Users;
            return (
              <div key={index} className={`reveal reveal-d${Math.min(index + 1, 9)} card-dark`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(45, 212, 191, 0.12)' }}>
                    <Icon size={20} style={{ color: '#2dd4bf' }} />
                  </div>
                  <h4 className="font-semibold text-lg leading-snug" style={{ color: '#e0f7fa' }}>{item.title}</h4>
                </div>
                <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.7)' }}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}