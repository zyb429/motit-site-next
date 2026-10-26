'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export type CallToActionProps = {
  label: string;
  title: string;
  desc: string;
  listItems: Array<{ text: string }>;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  imageUrl: string | null;
};

export default function CallToAction({ label, title, desc, listItems=[], ctaLabel, ctaHref, secondaryLabel, secondaryHref, imageUrl }: CallToActionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (typeof document !== 'undefined' && document.querySelector('.Puck')) return;

    const ctx = gsap.context(() => {
      gsap.from('.cta-image', { opacity: 0, x: -40, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 85%' } });
      gsap.from('.cta-content > *', { opacity: 0, y: 40, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.cta-content', start: 'top 85%' } });
    }, section);

    return () => ctx.revert();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(ctaHref.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section-padding" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container">
        <div ref={sectionRef}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {imageUrl && (
              <div className="cta-image" style={{ opacity: 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="w-full h-auto object-cover rounded-2xl" style={{ maxHeight: '480px' }} loading="lazy" />
              </div>
            )}
            <div className="cta-content">
              <span className="section-label block mb-3" style={{ opacity: 1 }}>{label}</span>
              <h2 className="section-title mb-5" style={{ opacity: 1 }}>{title}</h2>
              <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: 'rgba(128, 222, 234, 0.75)', opacity: 1 }}>{desc}</p>
              {listItems.length > 0 && (
                <ul className="flex flex-col gap-2 mb-8" style={{ opacity: 1 }}>
                  {listItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm md:text-base" style={{ color: 'rgba(128, 222, 234, 0.8)' }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#2dd4bf' }} />
                      {item.text}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-4" style={{ opacity: 1 }}>
                {ctaLabel && <button onClick={handleClick} className="btn-primary">{ctaLabel} <ArrowRight size={16} /></button>}
                {secondaryLabel && <a href={secondaryHref} target="_blank" rel="noopener noreferrer" className="btn-secondary">{secondaryLabel}</a>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}