'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export type KeyServicesProps = {
  label: string;
  title: string;
  subtitle: string;
  items: Array<{
    number: string;
    title: string;
    shortDesc: string;
    fullDesc: string;
  }>;
};

export default function KeyServices({ label, title, subtitle, items }: KeyServicesProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [openStates, setOpenStates] = useState<boolean[]>(
    (items ?? []).map(() => false)
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (typeof document !== 'undefined' && document.querySelector('.Puck')) return;

    const isSlowDevice =
      (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 480;

    if (isSlowDevice) {
      section.querySelectorAll('.reveal').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    section.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleCard = (index: number) => {
    setOpenStates((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <section style={{ backgroundColor: '#0d2029' }}>
      <div className="content-container section-padding">
        <div className="mb-18 md:mb-14">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4">{title}</h2>
          <p className="section-subtitle max-w-[560px]">{subtitle}</p>
        </div>

        <div
          ref={sectionRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-start"
        >
          {(items ?? []).map((service, index) => {
            const isOpen = openStates[index] || false;
            return (
              <div
                key={index}
                className={`reveal reveal-d${index + 1} card-dark relative overflow-hidden cursor-pointer`}
                onClick={() => toggleCard(index)}
                style={{
                  height: 'auto',
                  border: isOpen
                    ? '1.5px solid rgba(45, 212, 191, 0.2)'
                    : '1.5px solid transparent',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  padding: '24px 22px 20px',
                  backgroundColor: '#0f2832',
                  borderRadius: '16px',
                  boxShadow: isOpen
                    ? '0 8px 30px rgba(45, 212, 191, 0.06)'
                    : '0 4px 20px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: 1,
                }}
              >
                <span
                  className="block font-extrabold leading-[0.8] mb-3"
                  style={{
                    fontSize: 'clamp(2rem, 3.5vw, 3.8rem)',
                    color: 'rgba(45, 212, 191, 0.12)',
                  }}
                >
                  {service.number}
                </span>
                <h3
                  className="font-semibold text-base md:text-lg leading-snug mb-2"
                  style={{ color: '#e0f7fa' }}
                >
                  {service.title}
                </h3>
                <div>
                  <p
                    className="text-sm md:text-base leading-relaxed transition-all duration-300"
                    style={{
                      color: 'rgba(128, 222, 234, 0.7)',
                      display: '-webkit-box',
                      WebkitLineClamp: isOpen ? 'none' : 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {isOpen ? service.fullDesc : service.shortDesc}
                  </p>
                </div>

                <div
                  className="flex items-center gap-1.5 sm:gap-2 pt-3"
                  style={{
                    borderTop: '1px solid rgba(45, 212, 191, 0.08)',
                    marginTop: '12px',
                    flexShrink: 0,
                  }}
                >
                  <ChevronDown
                    size={16}
                    className="flex-shrink-0 transition-transform duration-300"
                    style={{
                      color: '#2dd4bf',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                  <span
                    className="text-[10px] sm:text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: '#2dd4bf',
                      minWidth: '70px',
                      display: 'inline-block',
                    }}
                  >
                    {isOpen ? 'Свернуть' : 'Подробнее'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}