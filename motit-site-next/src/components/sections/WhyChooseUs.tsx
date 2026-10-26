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
    <section className="section-padding" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container max-w-225">
        <div className="mb-10 md:mb-12 text-center">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4">{title}</h2>
          <p className="section-subtitle max-w-140 mx-auto">{subtitle}</p>
        </div>

        <div ref={sectionRef} className="reveal flex flex-col gap-3" style={{ opacity: 1 }}>
          {(items ?? []).map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: '#0f2832',
                  border: `1px solid ${isOpen ? 'rgba(45, 212, 191, 0.3)' : 'rgba(45, 212, 191, 0.08)'}`,
                  borderLeft: isOpen ? '3px solid #2dd4bf' : '3px solid transparent',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer"
                >
                  <h4
                    className="font-semibold leading-snug pr-4 transition-colors duration-300"
                    style={{
                      fontSize: 'clamp(1.1rem, 1.6vw, 1.35rem)',
                      color: isOpen ? '#2dd4bf' : '#e0f7fa',
                    }}
                  >
                    {item.title}
                  </h4>
                  <Plus
                    size={22}
                    className="shrink-0 transition-transform duration-300"
                    style={{
                      color: isOpen ? '#2dd4bf' : 'rgba(128, 222, 234, 0.5)',
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
                        className="font-semibold mb-2"
                        style={{ color: '#2dd4bf', fontSize: '1.05rem' }}
                      >
                        {item.subtitle}
                      </h5>
                      <p
                        className="text-sm md:text-base leading-relaxed"
                        style={{ color: 'rgba(128, 222, 234, 0.7)' }}
                      >
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