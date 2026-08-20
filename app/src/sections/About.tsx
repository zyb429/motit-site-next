import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    
    const ctx = gsap.context(() => {
      // Анимация изображения
      gsap.from('.about-image', { 
        opacity: 0, 
        scale: 1.02, 
        duration: 1, 
        ease: 'power3.out', 
        scrollTrigger: { 
          trigger: section, 
          start: 'top 85%' 
        } 
      });

      // Анимируем каждый элемент по отдельности для лучшего контроля
      const textElements = [
        '.about-label',
        '.about-title',
        '.about-text-p1',
        '.about-text-p2',
        '.about-btn'
      ];

      textElements.forEach((selector, i) => {
        gsap.from(selector, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power3.out',
          delay: i * 0.15,
          scrollTrigger: {
            trigger: '.about-text',
            start: 'top 85%',
          }
        });
      });
    }, section);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="section-padding" style={{ backgroundColor: '#0d2029' }}>
      <div className="content-container">
        <div className="about-image mb-10 md:mb-12">
          <img src="/images/about-image.jpg" alt="Офис МОТИТ" className="w-full object-cover rounded-2xl" style={{ height: '360px' }} loading="lazy" />
        </div>
        <div className="about-text max-w-[800px]">
          <span className="section-label block mb-3">КТО МЫ</span>
          <h2 className="section-title mb-5">МОТИТ — комплексные IT-решения для бизнеса</h2>
          <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: 'rgba(128, 222, 234, 0.75)' }}>
            Мы — команда профессионалов с многолетним опытом в сфере информационных технологий. Начиная с технической поддержки и заканчивая сложными проектами по кибербезопасности, мы сопровождаем наших клиентов на каждом этапе цифровой трансформации.
          </p>
          <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: 'rgba(128, 222, 234, 0.75)' }}>
            Наши клиенты — это компании разных отраслей и масштабов, которые доверяют нам свою IT-инфраструктуру. Мы гордимся долгосрочными партнерствами, построенными на доверии, прозрачности и результате.
          </p>
          <a href="#directions" className="btn-secondary inline-flex">Смотреть направления</a>
        </div>
      </div>
    </section>
  );
}
