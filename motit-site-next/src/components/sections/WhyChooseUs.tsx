'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Image from 'next/image';

export type WhyChooseUsProps = {
  label: string;
  title: string;
  subtitle: string;
  items: Array<{
    title: string;
    subtitle: string;
    description: string;
    image: string;
  }>;
};

export default function WhyChooseUs({ label, title, subtitle, items }: WhyChooseUsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (typeof document !== 'undefined' && document.querySelector('.Puck')) return;

    const isSlowDevice =
      (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 480;

    if (isSlowDevice) {
      section.style.opacity = '1';
      section.style.transform = 'none';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-padding bg-(--bg-primary) transition-colors duration-300">
      <div className="content-container max-w-225">
        <div className="mb-10 md:mb-12 text-center">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4 text-(--text-primary)">{title}</h2>
          <p className="section-subtitle max-w-140 mx-auto text-(--text-secondary)">{subtitle}</p>
        </div>

        <div ref={sectionRef} className="reveal flex flex-col gap-3" style={{ opacity: 1 }}>
          {(items ?? []).map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-xl overflow-hidden transition-all duration-300 bg-(--bg-card) border shadow-sm hover:shadow-md ${
                  isOpen ? 'border-(--accent) shadow-md' : 'border-(--border)'
                }`}
                style={{
                  borderLeft: isOpen ? '3px solid var(--accent)' : '3px solid transparent',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer"
                >
                  <h4
                    className={`font-semibold leading-snug pr-4 transition-colors duration-300 ${
                      isOpen ? 'text-(--accent)' : 'text-(--text-primary)'
                    }`}
                    style={{
                      fontSize: 'clamp(1.1rem, 1.6vw, 1.35rem)',
                    }}
                  >
                    {item.title}
                  </h4>
                  <Plus
                    size={22}
                    className={`shrink-0 transition-transform duration-300 ${
                      isOpen ? 'text-(--accent)' : 'text-(--text-muted)'
                    }`}
                    style={{
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                <div
                  className="overflow-hidden transition-all duration-300 ease-out"
                  style={{
                    maxHeight: isOpen ? '500px' : '0',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="px-5 md:px-6 pb-5 md:pb-6 flex flex-col md:flex-row gap-5">
                    <div className="md:w-[38%]">
                      <div className="relative w-full aspect-video">
                        <Image
                          src={item.image || '/images/placeholder.jpg'}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 38vw"
                          className="object-cover rounded-xl"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="md:w-[62%]">
                      <h5
                        className="font-semibold mb-2 text-(--accent)"
                        style={{ fontSize: '1.05rem' }}
                      >
                        {item.subtitle}
                      </h5>
                      <p className="text-sm md:text-base leading-relaxed text-(--text-secondary)">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}