'use client';

import { useRef } from 'react';
import { useReveal } from '../hooks/useReveal';
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

type DirectionItem = {
  icon: typeof Headphones | typeof Shield | typeof ClipboardCheck | typeof Bug | 
        typeof Home | typeof Code | typeof Globe | typeof Activity | 
        typeof ShieldCheck | typeof ShoppingCart;
  title: string;
  description: string;
};

const directions: DirectionItem[] = [
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

export default function Directions() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  return (
    <section ref={sectionRef} id="directions" className="section-padding" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container">
        <div className="reveal mb-12 md:mb-16">
          <span className="section-label block mb-3">ЧТО МЫ ДЕЛАЕМ</span>
          <h2 className="section-title mb-4">Наши направления</h2>
          <p className="section-subtitle max-w-[640px]">
            Полный спектр IT-услуг для вашего бизнеса — от консультаций до комплексного внедрения
          </p>
        </div>

         <div className="flex flex-wrap gap-4 md:gap-5 justify-center">
          {directions.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`
                  reveal reveal-d${Math.min(index + 1, 9)} 
                  group cursor-pointer rounded-2xl p-5 md:p-6 
                  transition-all duration-150 hover:-translate-y-1.5
                  w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] 
                  lg:w-[calc(25%-15px)] xl:w-[calc(20%-16px)]
                `}
                style={{
                  backgroundColor: '#0f2832',
                  border: '1px solid rgba(45, 212, 191, 0.08)',
                  minHeight: '200px',
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
      </div>
    </section>
  );
}
