'use client';

import { useRef, useEffect } from 'react';
import {
  Headphones,
  Shield,
  ClipboardCheck,
  Bug,
  Home,
  Code,
  Globe,
  Activity,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';

const directions = [
  { icon: Headphones, title: 'Техническая поддержка', description: 'Круглосуточная помощь вашим пользователям. Решаем любые IT-проблемы быстро и эффективно.' },
  { icon: Shield, title: 'СЗИ', description: 'Средства защиты информации для соответствия требованиям безопасности и регуляторных стандартов.' },
  { icon: ClipboardCheck, title: 'Аудит, проектирование, создание и аттестация', description: 'Полный цикл работ с ИТ-инфраструктурой — от аудита до официальной аттестации систем.' },
  { icon: Bug, title: 'Пентест', description: 'Тестирование на проникновение для выявления уязвимостей до того, как их найдут злоумышленники.' },
  { icon: Home, title: 'Умный дом', description: 'Проектирование и внедрение систем умного дома и автоматизации для офисов и жилых помещений.' },
  { icon: Code, title: 'Разработка программного обеспечения', description: 'Создание индивидуальных программных решений под задачи вашего бизнеса.' },
  { icon: Globe, title: 'Разработка и поддержка сайтов', description: 'Полный спектр услуг по созданию, развитию и технической поддержке веб-ресурсов.' },
  { icon: Activity, title: 'SOAR and SIEM', description: 'Автоматизация реагирования на инциденты и централизованный мониторинг безопасности.' },
  { icon: ShieldCheck, title: 'Антивирусная защита', description: 'Комплексная защита от вредоносных программ с использованием лучших решений на рынке.' },
  { icon: ShoppingCart, title: 'Продажа продуктов', description: 'Поставка лицензионного программного обеспечения, оборудования и IT-решений.' },
];

export default function DirectionsClient() {
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
    <div ref={sectionRef} className="flex flex-wrap gap-4 md:gap-5 justify-center">
      {directions.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`reveal reveal-d${Math.min(index + 1, 9)} group cursor-pointer rounded-2xl p-5 md:p-6 transition-all duration-150 hover:-translate-y-1.5 w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] xl:w-[calc(20%-16px)]`}
            style={{
              backgroundColor: '#0f2832',
              border: '1px solid rgba(45, 212, 191, 0.08)',
              minHeight: '200px',
              opacity: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)';
              e.currentTarget.style.backgroundColor = '#153541';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.08)';
              e.currentTarget.style.backgroundColor = '#0f2832';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-150 group-hover:scale-110" style={{ backgroundColor: 'rgba(45, 212, 191, 0.12)' }}>
              <Icon size={22} style={{ color: '#2dd4bf' }} />
            </div>
            <h3 className="font-semibold text-base md:text-lg leading-snug mb-2" style={{ color: '#e0f7fa' }}>
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.65)' }}>
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}