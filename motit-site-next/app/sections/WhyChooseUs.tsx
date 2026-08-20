'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

gsap.registerPlugin(ScrollTrigger);

const accordionItems = [
  { title: 'Сетевое администрирование', subtitle: 'Профессиональный подход к сетям', description: 'Проектируем, настраиваем и обслуживаем корпоративные сети любой сложности. Мониторинг 24/7, оперативное устранение неисправностей, регулярное обновление оборудования.', image: '/images/acc-network.jpg' },
  { title: 'Информационная безопасность', subtitle: 'Комплексная защита данных', description: 'Аудит безопасности, внедрение СЗИ, тестирование на проникновение, подготовка к аттестации. Мы защищаем ваши данные на всех уровнях инфраструктуры.', image: '/images/acc-security.jpg' },
  { title: 'Обслуживание техники', subtitle: 'Ремонт и обслуживание оборудования', description: 'Ремонт компьютеров, серверов и оргтехники. Профилактическое обслуживание, замена комплектующих, консультации по выбору техники.', image: '/images/acc-repair.jpg' },
  { title: 'Мониторинг и SIEM', subtitle: 'Контроль и анализ событий', description: 'Настройка систем мониторинга и SIEM-платформ для своевременного обнаружения угроз и инцидентов. Автоматизация реагирования с помощью SOAR.', image: '/images/acc-monitoring.jpg' },
];

export default function WhyChooseUs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isFirstRender = useRef(true);
  useReveal(sectionRef);

  useEffect(() => {
    contentRefs.current.forEach((content, i) => {
      if (!content) return;
      const inner = innerRefs.current[i];
      if (!inner) return;

      if (i === openIndex) {
        if (isFirstRender.current) {
          gsap.set(content, { height: 'auto', opacity: 1 });
          gsap.set(inner, { opacity: 1, y: 0 });
          const img = inner.querySelector('img');
          if (img) gsap.set(img, { opacity: 1 });
        } else {
          // Открытие с задержкой
          gsap.to(content, { 
            height: 'auto', 
            opacity: 1, 
            duration: 0.4, 
            ease: 'power2.out',
            delay: 0.2 // Задержка перед открытием
          });
          
          gsap.fromTo(inner, 
            { opacity: 0, y: 20 }, 
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.35, 
              ease: 'power2.out',
              delay: 0.3,
              clearProps: 'transform'
            }
          );

          const img = inner.querySelector('img');
          if (img) {
            gsap.fromTo(img, 
              { opacity: 0 }, 
              { 
                opacity: 1, 
                duration: 0.25, 
                ease: 'power1.out',
                delay: 0.25,
                clearProps: 'opacity'
              }
            );
          }
        }
      } else {
        // Плавное закрытие
        gsap.to(content, { 
          height: 0, 
          opacity: 0, 
          duration: 0.45, 
          ease: 'power3.inOut'
        });
      }
    });

    isFirstRender.current = false;
  }, [openIndex]);

  return (
    <section ref={sectionRef} className="section-padding" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container max-w-[900px]">
        <div className="reveal mb-10 md:mb-12 text-center">
          <span className="section-label block mb-3">НАШИ КОМПЕТЕНЦИИ</span>
          <h2 className="section-title mb-4">Экспертиза в ключевых областях</h2>
          <p className="section-subtitle max-w-[560px] mx-auto">Глубокие знания и практический опыт в каждом направлении</p>
        </div>

        <div className="reveal flex flex-col gap-3">
          {accordionItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl overflow-hidden transition-all duration-150"
                style={{
                  backgroundColor: '#0f2832',
                  border: '1px solid rgba(45, 212, 191, 0.08)',
                  borderLeft: isOpen ? '3px solid #2dd4bf' : '3px solid transparent',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer"
                >
                  <h4
                    className="font-semibold leading-snug pr-4 transition-colors duration-150"
                    style={{
                      fontSize: 'clamp(1.1rem, 1.6vw, 1.35rem)',
                      color: isOpen ? '#2dd4bf' : '#e0f7fa',
                    }}
                  >
                    {item.title}
                  </h4>
                  <Plus
                    size={22}
                    className="flex-shrink-0 transition-transform duration-200"
                    style={{
                      color: isOpen ? '#2dd4bf' : 'rgba(128, 222, 234, 0.5)',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                <div ref={(el) => { contentRefs.current[index] = el; }} className="overflow-hidden">
                  <div ref={(el) => { innerRefs.current[index] = el; }} className="px-5 md:px-6 pb-5 md:pb-6 flex flex-col md:flex-row gap-5">
                    <div className="md:w-[38%]">
                      <img src={item.image} alt={item.title} className="w-full aspect-video object-cover rounded-xl" loading="lazy" />
                    </div>
                    <div className="md:w-[62%]">
                      <h5 className="font-semibold mb-2" style={{ color: '#2dd4bf', fontSize: '1.05rem' }}>{item.subtitle}</h5>
                      <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.7)' }}>{item.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
