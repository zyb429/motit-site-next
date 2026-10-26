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
    <section id="faq" className="section-padding" style={{ backgroundColor: '#0d2029' }}>
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-[0.3fr_0.7fr] gap-10 lg:gap-14">
          <div>
            <span className="section-label block mb-3">{label}</span>
            <h2 className="section-title mb-4">{title}</h2>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.7)' }}>{subtitle}</p>
          </div>
          <div ref={sectionRef} className="reveal flex flex-col gap-3" style={{ opacity: 1 }}>
            {(items ?? []).map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="rounded-xl overflow-hidden" style={{ backgroundColor: '#0f2832', border: `1px solid ${isOpen ? 'rgba(45, 212, 191, 0.3)' : 'rgba(45, 212, 191, 0.08)'}`, transition: 'border-color 0.3s ease-out' }}>
                  <button onClick={() => setOpenIndex(isOpen ? null : index)} className="w-full flex items-start justify-between p-5 md:p-6 text-left cursor-pointer">
                    <div className="flex-1 pr-4">
                      <span className="section-label block mb-2">{item.tag}</span>
                      <h4 className="font-semibold leading-snug" style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)', color: isOpen ? '#2dd4bf' : '#e0f7fa', transition: 'color 0.3s ease-out' }}>{item.question}</h4>
                    </div>
                    <Plus size={22} className="flex-shrink-0 mt-1 transition-transform duration-200" style={{ color: isOpen ? '#2dd4bf' : 'rgba(128, 222, 234, 0.5)', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }} />
                  </button>
                  <div ref={(el) => { contentRefs.current[index] = el; }} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
                    <div ref={(el) => { answerRefs.current[index] = el; }} className="px-5 md:px-6 pb-5 md:pb-6">
                      <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.7)' }}>{item.answer}</p>
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