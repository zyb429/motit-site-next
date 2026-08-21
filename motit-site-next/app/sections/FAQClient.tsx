'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';

const faqItems = [
  { question: 'Какие услуги вы предоставляете?', tag: 'Услуги', answer: 'Мы предоставляем полный спектр IT-услуг: техническую поддержку, настройку и администрирование сетей, информационную безопасность, поставку оборудования и ПО, разработку программного обеспечения и сайтов, умный дом и многое другое. Полный список — в разделе "Наши направления".' },
  { question: 'Как быстро вы реагируете на запросы?', tag: 'Скорость', answer: 'Мы реагируем на критические инциденты в течение 15 минут. Стандартные запросы обрабатываются в течение нескольких часов. Режим работы: пн–пт, 9:00–18:00. Для клиентов с SLA доступна круглосуточная поддержка.' },
  { question: 'С какими компаниями вы работаете?', tag: 'Клиенты', answer: 'Мы работаем с организациями любого размера — от небольших офисов до крупных корпораций. Наши клиенты представляют различные отрасли: финансы, производство, образование, медицина, торговля и государственный сектор.' },
  { question: 'Как связаться с вашей техподдержкой?', tag: 'Поддержка', answer: 'Вы можете оставить заявку через портал help.motit.by, позвонить по номеру +375 (29) 118-50-82 или отправить письмо на info@motit.by. Наши специалисты свяжутся с вами в кратчайшие сроки.' },
  { question: 'Работаете ли вы в регионах Беларуси?', tag: 'География', answer: 'Да, мы работаем по всей Беларуси. Большая часть работ может быть выполнена удаленно. При необходимости выезда наших специалистов — договариваемся индивидуально.' },
];

export default function FAQClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Лёгкая анимация появления
    const isSlowDevice = 
      (navigator.hardwareConcurrency || 8) <= 4 ||
      window.innerWidth < 480;

    if (isSlowDevice) {
      section.style.opacity = '1';
      section.style.transform = 'none';
    } else {
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

      observer.observe(section);

      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    contentRefs.current.forEach((content, i) => {
      if (!content) return;
      const answer = answerRefs.current[i];
      if (!answer) return;

      if (i === openIndex) {
        if (isFirstRender.current) {
          // Первый рендер — просто покажите
          content.style.height = 'auto';
          content.style.opacity = '1';
          if (answer) {
            answer.style.opacity = '1';
            answer.style.transform = 'none';
          }
        } else {
          // Плавное открытие
          content.style.height = 'auto';
          content.style.opacity = '1';
          content.style.transition = 'height 0.35s ease-out, opacity 0.35s ease-out';
          
          if (answer) {
            answer.style.opacity = '0';
            answer.style.transform = 'translateY(10px)';
            answer.style.transition = 'opacity 0.35s ease-out, transform 0.35s ease-out';
            
            requestAnimationFrame(() => {
              answer.style.opacity = '1';
              answer.style.transform = 'translateY(0)';
            });
          }
        }
      } else {
        // Плавное закрытие
        content.style.height = '0';
        content.style.opacity = '0';
        content.style.transition = 'height 0.25s ease-in, opacity 0.25s ease-in';
      }
    });

    isFirstRender.current = false;
  }, [openIndex]);

  return (
    <div ref={sectionRef} className="reveal flex flex-col gap-3" style={{ opacity: 1 }}>
      {faqItems.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className="rounded-xl overflow-hidden" 
            style={{ 
              backgroundColor: '#0f2832', 
              border: `1px solid ${isOpen ? 'rgba(45, 212, 191, 0.3)' : 'rgba(45, 212, 191, 0.08)'}`,
              transition: 'border-color 0.3s ease-out',
            }}
          >
            <button 
              onClick={() => setOpenIndex(isOpen ? null : index)} 
              className="w-full flex items-start justify-between p-5 md:p-6 text-left cursor-pointer"
            >
              <div className="flex-1 pr-4">
                <span className="section-label block mb-2">{item.tag}</span>
                <h4 
                  className="font-semibold leading-snug" 
                  style={{ 
                    fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)', 
                    color: isOpen ? '#2dd4bf' : '#e0f7fa',
                    transition: 'color 0.3s ease-out',
                  }}
                >
                  {item.question}
                </h4>
              </div>
              <Plus
                size={22}
                className="flex-shrink-0 mt-1 transition-transform duration-200"
                style={{ 
                  color: isOpen ? '#2dd4bf' : 'rgba(128, 222, 234, 0.5)', 
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' 
                }}
              />
            </button>
            <div
              ref={(el) => { contentRefs.current[index] = el; }}
              className="overflow-hidden"
              style={{ height: 0, opacity: 0 }}
            >
              <div 
                ref={(el) => { answerRefs.current[index] = el; }} 
                className="px-5 md:px-6 pb-5 md:pb-6"
              >
                <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.7)' }}>
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}