'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const keyServices = [
  {
    number: '01',
    title: 'SOAR и SIEM',
    shortDesc: 'Внедрение систем корреляции событий и автоматического реагирования на инциденты безопасности. Централизованный мониторинг всех источников данных в реальном времени.',
    fullDesc: 'Интегрируем платформы SIEM для сбора и анализа событий безопасности из всех источников вашей инфраструктуры. Настраиваем SOAR для автоматизации реагирования на инциденты, что сокращает время реакции с часов до минут. Включает настройку правил корреляции, дашбордов, оповещений и интеграцию с существующими системами защиты.',
  },
  {
    number: '02',
    title: 'Антивирусная защита',
    shortDesc: 'Развертывание и управление корпоративными антивирусными решениями. Защита рабочих станций, серверов и мобильных устройств от всех типов угроз.',
    fullDesc: 'Поставляем и настраиваем корпоративные антивирусные решения ведущих вендоров (Kaspersky, ESET, Trend Micro и др.). Обеспечиваем централизованное управление политиками защиты, регулярное обновление баз, мониторинг состояния защиты и оперативное реагирование на обнаруженные угрозы. Включает защиту рабочих станций, серверов, почтовых систем и мобильных устройств.',
  },
  {
    number: '03',
    title: 'Сетевое оборудование',
    shortDesc: 'Поставка, настройка и обслуживание сетевого оборудования ведущих производителей. Проектирование отказоустойчивых сетевых инфраструктур.',
    fullDesc: 'Подбираем, поставляем и настраиваем сетевое оборудование от ведущих производителей: коммутаторы, маршрутизаторы, точки доступа Wi-Fi, файрволы, системы IPS/IDS. Проектируем сетевую архитектуру с учётом требований к производительности, безопасности и отказоустойчивости. Предоставляем гарантийное и постгарантийное обслуживание.',
  },
];

export default function KeyServicesClient() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [openStates, setOpenStates] = useState<boolean[]>(keyServices.map(() => false));

  // Лёгкая анимация появления
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

  const toggleCard = (index: number) => {
    setOpenStates(prev => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  return (
    <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-start">
      {keyServices.map((service, index) => {
        const isOpen = openStates[index] || false;
        return (
          <div
            key={index}
            className={`reveal reveal-d${index + 1} card-dark relative overflow-hidden cursor-pointer`}
            onClick={() => toggleCard(index)}
            style={{
              height: 'auto',
              border: isOpen ? '1.5px solid rgba(45, 212, 191, 0.2)' : '1.5px solid transparent',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              padding: '24px 22px 20px',
              backgroundColor: '#0f2832',
              borderRadius: '16px',
              boxShadow: isOpen 
                ? '0 8px 30px rgba(45, 212, 191, 0.06)' 
                : '0 4px 20px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              opacity: 1,
            }}
          >
            <span className="block font-extrabold leading-[0.8] mb-3" style={{ fontSize: 'clamp(2rem, 3.5vw, 3.8rem)', color: 'rgba(45, 212, 191, 0.12)' }}>
              {service.number}
            </span>
            <h3 className="font-semibold text-base md:text-lg leading-snug mb-2" style={{ color: '#e0f7fa' }}>
              {service.title}
            </h3>
            <div>
              <p 
                className="text-sm md:text-base leading-relaxed transition-all duration-300"
                style={{ 
                  color: 'rgba(128, 222, 234, 0.7)',
                  display: '-webkit-box',
                  WebkitLineClamp: isOpen ? 'none' : 5,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {isOpen ? service.fullDesc : service.shortDesc}
              </p>
            </div>

            <div 
              className="flex items-center gap-1.5 sm:gap-2 pt-3"
              style={{
                borderTop: '1px solid rgba(45, 212, 191, 0.08)',
                marginTop: '12px',
                flexShrink: 0,
              }}
            >
              <ChevronDown
                size={16}
                className="flex-shrink-0 transition-transform duration-300"
                style={{ 
                  color: '#2dd4bf', 
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
                }}
              />
              <span 
                className="text-[10px] sm:text-xs font-medium uppercase tracking-wider"
                style={{ 
                  color: '#2dd4bf',
                  minWidth: '70px',
                  display: 'inline-block',
                }}
              >
                {isOpen ? 'Свернуть' : 'Подробнее'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}