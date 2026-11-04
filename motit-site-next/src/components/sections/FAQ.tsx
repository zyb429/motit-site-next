'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

export type FAQProps = {
  label: string;
  title: string;
  subtitle: string;
  items: Array<{ tag: string; question: string; answer: string }>;
};

export default function FAQ({ label, title, subtitle, items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const isSlowDevice = (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 480;
    if (isSlowDevice) { section.style.opacity = '1'; section.style.transform = 'none'; return; }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    contentRefs.current.forEach((content, i) => {
      if (!content) return;
      const answer = answerRefs.current[i];
      if (!answer) return;
      if (i === openIndex) {
        content.style.height = 'auto';
        content.style.opacity = '1';
        content.style.transition = 'height 0.35s ease-out, opacity 0.35s ease-out';
        answer.style.opacity = '0';
        answer.style.transform = 'translateY(10px)';
        answer.style.transition = 'opacity 0.35s ease-out, transform 0.35s ease-out';
        requestAnimationFrame(() => { answer.style.opacity = '1'; answer.style.transform = 'translateY(0)'; });
      } else {
        content.style.height = '0';
        content.style.opacity = '0';
        content.style.transition = 'height 0.25s ease-in, opacity 0.25s ease-in';
      }
    });
  }, [openIndex]);

  return (
    <section id="faq" className="section-padding bg-(--bg-secondary) transition-colors duration-300">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-[0.3fr_0.7fr] gap-10 lg:gap-14">
          <div>
            <span className="section-label block mb-3">{label}</span>
            <h2 className="section-title mb-4 text-(--text-primary)">{title}</h2>
            <p className="text-base md:text-lg leading-relaxed text-(--text-secondary)">{subtitle}</p>
          </div>
          <div ref={sectionRef} className="reveal flex flex-col gap-3" style={{ opacity: 1 }}>
            {(items ?? []).map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className={`rounded-xl overflow-hidden transition-colors duration-300 bg-(--bg-card) border ${isOpen ? 'border-(--accent)' : 'border-(--border)'}`}>
                  <button onClick={() => setOpenIndex(isOpen ? null : index)} className="w-full flex items-start justify-between p-5 md:p-6 text-left cursor-pointer">
                    <div className="flex-1 pr-4">
                      <span className="section-label block mb-2">{item.tag}</span>
                      <h4 className={`font-semibold leading-snug transition-colors duration-300 ${isOpen ? 'text-(--accent)' : 'text-(--text-primary)'}`} style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)' }}>{item.question}</h4>
                    </div>
                    <Plus size={22} className={`flex-shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'text-(--accent)' : 'text-(--text-muted)'}`} style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }} />
                  </button>
                  <div ref={(el) => { contentRefs.current[index] = el; }} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
                    <div ref={(el) => { answerRefs.current[index] = el; }} className="px-5 md:px-6 pb-5 md:pb-6">
                      <p className="text-sm md:text-base leading-relaxed text-(--text-secondary)">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}