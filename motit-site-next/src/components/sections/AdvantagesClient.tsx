'use client';

import { useRef, useEffect } from 'react';
import { Users, Target, Cpu, Clock, HeadphonesIcon, Award } from 'lucide-react';

const advantages = [
  { icon: Users, title: 'Профессиональная команда', description: 'Наши специалисты имеют многолетний опыт в сфере информационных технологий. Сертифицированные эксперты по кибербезопасности, сетевому администрированию и разработке ПО готовы решить задачи любой сложности.' },
  { icon: Target, title: 'Индивидуальный подход', description: 'Мы изучаем специфику вашего бизнеса и предлагаем решения, которые идеально соответствуют вашим задачам и бюджету. Никаких шаблонных решений — только персональная стратегия.' },
  { icon: Cpu, title: 'Современные технологии', description: 'Работаем с передовыми технологиями и программными продуктами ведущих мировых вендоров. Постоянно следим за трендами и внедряем инновации, чтобы ваш бизнес был на шаг впереди.' },
  { icon: Clock, title: 'Оперативная реакция', description: 'Среднее время реагирования на критические инциденты — от 15 минут. Наша служба поддержки работает круглосуточно, чтобы ваши системы функционировали без перебоев.' },
  { icon: HeadphonesIcon, title: 'Полный цикл услуг', description: 'От консультации до внедрения и дальнейшей поддержки — мы сопровождаем клиентов на всех этапах. Одно окно для всех IT-запросов экономит ваше время и ресурсы.' },
  { icon: Award, title: 'Гарантия качества', description: 'Предоставляем гарантии на все выполненные работы и внедренные решения. Регулярный мониторинг и отчетность позволяют отслеживать эффективность наших услуг в реальном времени.' },
];

export default function AdvantagesClient() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const isSlowDevice = 
      (navigator.hardwareConcurrency || 8) <= 4 ||
      window.innerWidth < 480;

    if (isSlowDevice) {
      section.querySelectorAll('.reveal').forEach(el => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    section.querySelectorAll('.reveal').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {advantages.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className={`reveal reveal-d${Math.min(index + 1, 9)} card-dark`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(45, 212, 191, 0.12)' }}>
                <Icon size={20} style={{ color: '#2dd4bf' }} />
              </div>
              <h4 className="font-semibold text-lg leading-snug" style={{ color: '#e0f7fa' }}>{item.title}</h4>
            </div>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.7)' }}>{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}