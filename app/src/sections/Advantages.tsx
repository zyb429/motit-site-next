import { useRef } from 'react';
import { useReveal } from '../hooks/useReveal';
import { Users, Target, Cpu, Clock, HeadphonesIcon, Award } from 'lucide-react';

const advantages = [
  { icon: Users, title: 'Профессиональная команда', description: 'Наши специалисты имеют многолетний опыт в сфере информационных технологий. Сертифицированные эксперты по кибербезопасности, сетевому администрированию и разработке ПО готовы решить задачи любой сложности.' },
  { icon: Target, title: 'Индивидуальный подход', description: 'Мы изучаем специфику вашего бизнеса и предлагаем решения, которые идеально соответствуют вашим задачам и бюджету. Никаких шаблонных решений — только персональная стратегия.' },
  { icon: Cpu, title: 'Современные технологии', description: 'Работаем с передовыми технологиями и программными продуктами ведущих мировых вендоров. Постоянно следим за трендами и внедряем инновации, чтобы ваш бизнес был на шаг впереди.' },
  { icon: Clock, title: 'Оперативная реакция', description: 'Среднее время реагирования на критические инциденты — от 15 минут. Наша служба поддержки работает круглосуточно, чтобы ваши системы функционировали без перебоев.' },
  { icon: HeadphonesIcon, title: 'Полный цикл услуг', description: 'От консультации до внедрения и дальнейшей поддержки — мы сопровождаем клиентов на всех этапах. Одно окно для всех IT-запросов экономит ваше время и ресурсы.' },
  { icon: Award, title: 'Гарантия качества', description: 'Предоставляем гарантии на все выполненные работы и внедренные решения. Регулярный мониторинг и отчетность позволяют отслеживать эффективность наших услуг в реальном времени.' },
];

export default function Advantages() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  return (
    <section ref={sectionRef} className="section-padding" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container">
        <div className="reveal mb-12 md:mb-16">
          <span className="section-label block mb-3">ПОЧЕМУ МЫ</span>
          <h2 className="section-title mb-4">Преимущества работы с нами</h2>
          <p className="section-subtitle max-w-[600px]">Мы строим долгосрочные партнерства, основанные на доверии и результате</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
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
      </div>
    </section>
  );
}
