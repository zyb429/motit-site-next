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
    <section className="section-padding bg-(--bg-primary) transition-colors duration-300">
      <div className="content-container">
        <div className="mb-12 md:mb-16">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4 text-(--text-primary)">{title}</h2>
          <p className="section-subtitle max-w-[600px] text-(--text-secondary)">{subtitle}</p>
        </div>
        <div ref={sectionRef} className="flex flex-wrap gap-5 md:gap-6 justify-center">
          {(items ?? []).map((item, index) => {
            const Icon = (ICONS as any)[item.icon] ?? Users;
            return (
              <div
                key={index}
                className={`reveal reveal-d${Math.min(index + 1, 9)} card w-[calc(100%-0px)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]`}
                style={{ opacity: 1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-(--accent-dim)">
                    <Icon size={20} className="text-(--accent)" />
                  </div>
                  <h4 className="font-semibold text-lg leading-snug text-(--text-primary)">{item.title}</h4>
                </div>
                <p className="text-sm md:text-base leading-relaxed text-(--text-secondary)">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}