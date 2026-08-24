'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Регистрируем плагин только на клиенте
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroClient() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const ctx = gsap.context(() => {
      // === АНИМАЦИЯ КОНТЕНТА ===
      const tl = gsap.timeline({ delay: 0.4 });
      tl.from('.hero-label', { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' })
        .from('.hero-title', { opacity: 0, y: 50, duration: 0.8, ease: 'power3.out' }, '-=0.3')
        .from('.hero-subtitle', { opacity: 0, y: 40, duration: 0.7, ease: 'power3.out' }, '-=0.4')
        .from('.hero-desc', { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' }, '-=0.3')
        .from('.hero-cta', { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out' }, '-=0.2');

      // === ПАРАЛЛАКС КОНТЕНТА ===
      gsap.to(content, {
        y: -60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: content.parentElement,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // === ВОЗВРАЩАЕМ БЛИКИ ===
      
      // Блик 1 - плавное движение
      gsap.to('.hero-bg-sparkle-1', {
        y: -120,
        x: 80,
        rotation: 360,
        duration: 10,
        repeat: -1,
        ease: 'sine.inOut',
        yoyo: true,
      });

      // Блик 2 - движение по диагонали
      gsap.to('.hero-bg-sparkle-2', {
        y: 100,
        x: -60,
        rotation: -360,
        duration: 12,
        repeat: -1,
        ease: 'sine.inOut',
        yoyo: true,
      });

      // Блик 3 - широкое движение
      gsap.to('.hero-bg-sparkle-3', {
        y: -80,
        x: 120,
        rotation: 720,
        duration: 15,
        repeat: -1,
        ease: 'sine.inOut',
        yoyo: true,
      });

      // Блик 4 - противоположное движение
      gsap.to('.hero-bg-sparkle-4', {
        y: 140,
        x: -100,
        rotation: -720,
        duration: 14,
        repeat: -1,
        ease: 'sine.inOut',
        yoyo: true,
      });

      // Блик 5 - дополнительный маленький
      gsap.to('.hero-bg-sparkle-5', {
        y: -60,
        x: 200,
        rotation: 540,
        duration: 18,
        repeat: -1,
        ease: 'sine.inOut',
        yoyo: true,
      });

      // Блик 6 - еще один маленький
      gsap.to('.hero-bg-sparkle-6', {
        y: 80,
        x: -150,
        rotation: -540,
        duration: 16,
        repeat: -1,
        ease: 'sine.inOut',
        yoyo: true,
      });

      // Пульсация всех бликов
      gsap.to('.hero-bg-sparkle-1, .hero-bg-sparkle-2, .hero-bg-sparkle-3, .hero-bg-sparkle-4, .hero-bg-sparkle-5, .hero-bg-sparkle-6', {
        scale: 2,
        opacity: 0.7,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.2,
      });

    }, content);

    return () => ctx.revert();
  }, []);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('directions');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      ref={contentRef}
      className="relative z-[2] content-container w-full pt-20"
    >
      {/* === ФОНОВЫЕ БЛИКИ === */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="hero-bg-sparkle-1 absolute top-1/4 left-1/4 w-3 h-3 bg-[#2dd4bf] rounded-full opacity-30 blur-[1.5px]" />
        <div className="hero-bg-sparkle-2 absolute top-1/3 right-1/4 w-2.5 h-2.5 bg-[#4dd0e1] rounded-full opacity-40 blur-[1px]" />
        <div className="hero-bg-sparkle-3 absolute bottom-1/3 left-1/3 w-4 h-4 bg-[#2dd4bf] rounded-full opacity-25 blur-[2px]" />
        <div className="hero-bg-sparkle-4 absolute top-1/2 right-1/3 w-2 h-2 bg-[#80deea] rounded-full opacity-35 blur-[1px]" />
        <div className="hero-bg-sparkle-5 absolute bottom-1/4 left-1/5 w-2 h-2 bg-[#2dd4bf] rounded-full opacity-30 blur-[1px]" />
        <div className="hero-bg-sparkle-6 absolute top-2/3 right-1/5 w-2.5 h-2.5 bg-[#4dd0e1] rounded-full opacity-25 blur-[1.5px]" />
      </div>

      {/* === КОНТЕНТ === */}
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
  );
}