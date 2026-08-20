'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.4 });
      tl.from('.hero-label', { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' })
        .from('.hero-title', { opacity: 0, y: 50, duration: 0.8, ease: 'power3.out' }, '-=0.3')
        .from('.hero-subtitle', { opacity: 0, y: 40, duration: 0.7, ease: 'power3.out' }, '-=0.4')
        .from('.hero-desc', { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' }, '-=0.3')
        .from('.hero-cta', { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out' }, '-=0.2');

      gsap.to(content, {
        y: -60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('directions');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
    >
      <div
        ref={contentRef}
        className="relative z-[2] content-container w-full pt-20"
      >
        <span className="hero-label section-label block mb-4">
          IT-РЕШЕНИЯ ДЛЯ БИЗНЕСА
        </span>

        <h1
          className="hero-title font-extrabold uppercase tracking-[-0.02em] leading-[0.95]"
          style={{
            fontSize: 'clamp(3rem, 8vw, 6.5rem)',
            color: '#e0f7fa',
            textShadow: '0 0 80px rgba(45, 212, 191, 0.2)',
          }}
        >
          МОТИТ
        </h1>

        <h2
          className="hero-subtitle mt-3 font-bold uppercase tracking-[-0.01em] leading-[1.05]"
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            color: 'rgba(128, 222, 234, 0.85)',
          }}
        >
          Ваш надежный IT-партнер
        </h2>

        <p
          className="hero-desc mt-6 max-w-[560px] text-base md:text-lg leading-relaxed"
          style={{ color: 'rgba(128, 222, 234, 0.7)' }}
        >
          Предоставляем полный спектр IT-услуг для бизнеса любого масштаба. 
          От технической поддержки до комплексной защиты инфраструктуры.
        </p>

        <div className="hero-cta mt-10 flex flex-wrap gap-4">
          <button onClick={handleCtaClick} className="btn-primary">
            Наши направления
          </button>
          <a
            href="https://help.motit.by"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Техподдержка
          </a>
        </div>
      </div>
    </section>
  );
}
