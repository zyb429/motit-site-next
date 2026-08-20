'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

gsap.registerPlugin(ScrollTrigger);

const faqItems = [
  { question: 'Какие услуги вы предоставляете?', tag: 'Услуги', answer: 'Мы предоставляем полный спектр IT-услуг: техническую поддержку, настройку и администрирование сетей, информационную безопасность, поставку оборудования и ПО, разработку программного обеспечения и сайтов, умный дом и многое другое. Полный список — в разделе "Наши направления".' },
  { question: 'Как быстро вы реагируете на запросы?', tag: 'Скорость', answer: 'Мы реагируем на критические инциденты в течение 15 минут. Стандартные запросы обрабатываются в течение нескольких часов. Режим работы: пн–пт, 9:00–18:00. Для клиентов с SLA доступна круглосуточная поддержка.' },
  { question: 'С какими компаниями вы работаете?', tag: 'Клиенты', answer: 'Мы работаем с организациями любого размера — от небольших офисов до крупных корпораций. Наши клиенты представляют различные отрасли: финансы, производство, образование, медицина, торговля и государственный сектор.' },
  { question: 'Как связаться с вашей техподдержкой?', tag: 'Поддержка', answer: 'Вы можете оставить заявку через портал help.motit.by, позвонить по номеру +375 (29) 118-50-82 или отправить письмо на info@motit.by. Наши специалисты свяжутся с вами в кратчайшие сроки.' },
  { question: 'Работаете ли вы в регионах Беларуси?', tag: 'География', answer: 'Да, мы работаем по всей Беларуси. Большая часть работ может быть выполнена удаленно. При необходимости выезда наших специалистов — договариваемся индивидуально.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);
  useReveal(sectionRef);

  useEffect(() => {
    contentRefs.current.forEach((content, i) => {
      if (!content) return;
      const answer = answerRefs.current[i];
      if (!answer) return;

      if (i === openIndex) {
        gsap.set(content, { height: 'auto', opacity: 1 });
        gsap.from(answer, { opacity: 0, y: 10, duration: 0.35, ease: 'power2.out' });
      } else {
        gsap.to(content, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.in' });
      }
    });
  }, [openIndex]);

  return (
    <section ref={sectionRef} id="faq" className="section-padding" style={{ backgroundColor: '#0d2029' }}>
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-[0.3fr_0.7fr] gap-10 lg:gap-14">
          <div className="reveal">
            <span className="section-label block mb-3">FAQ</span>
            <h2 className="section-title mb-4">Частые вопросы</h2>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.7)' }}>Отвечаем на самые популярные вопросы. Не нашли ответ? Свяжитесь с нами.</p>
          </div>
          <div className="reveal flex flex-col gap-3">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="rounded-xl overflow-hidden" style={{ backgroundColor: '#0f2832', border: '1px solid rgba(45, 212, 191, 0.08)' }}>
                  <button onClick={() => setOpenIndex(isOpen ? null : index)} className="w-full flex items-start justify-between p-5 md:p-6 text-left cursor-pointer">
                    <div className="flex-1 pr-4">
                      <span className="section-label block mb-2">{item.tag}</span>
                      <h4 className="font-semibold leading-snug" style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)', color: '#e0f7fa' }}>{item.question}</h4>
                    </div>
                    <Plus
                      size={22}
                      className="flex-shrink-0 mt-1 transition-transform duration-200"
                      style={{ color: isOpen ? '#2dd4bf' : 'rgba(128, 222, 234, 0.5)', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  <div
                    ref={(el) => { contentRefs.current[index] = el; }}
                    className="overflow-hidden"
                  >
                    <div ref={(el) => { answerRefs.current[index] = el; }} className="px-5 md:px-6 pb-5 md:pb-6">
                      <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.7)' }}>{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
