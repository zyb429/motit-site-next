'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function CallToAction() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.from('.cta-image', { opacity: 0, x: -40, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 85%' } });
      gsap.from('.cta-content > *', { opacity: 0, y: 40, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.cta-content', start: 'top 85%' } });
    }, section);
    return () => ctx.revert();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className="section-padding" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="cta-image">
            <img src="/images/cta-image.jpg" alt="Команда МОТИТ" className="w-full h-auto object-cover rounded-2xl" style={{ maxHeight: '480px' }} loading="lazy" />
          </div>
          <div className="cta-content">
            <span className="section-label block mb-3">НАЧНИТЕ С НАМИ</span>
            <h2 className="section-title mb-5">Готовы улучшить вашу IT-инфраструктуру?</h2>
            <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: 'rgba(128, 222, 234, 0.75)' }}>
              Наши специалисты проведут бесплатную консультацию и подготовят персональное предложение под задачи вашего бизнеса. Мы работаем с компаниями любого масштаба.
            </p>
            <ul className="flex flex-col gap-2 mb-8">
              {['Бесплатная консультация', 'Индивидуальный подход', 'Работаем по всей Беларуси'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm md:text-base" style={{ color: 'rgba(128, 222, 234, 0.8)' }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#2dd4bf' }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleClick} className="btn-primary">
                Связаться <ArrowRight size={16} />
              </button>
              <a href="https://help.motit.by" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                Техподдержка
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
