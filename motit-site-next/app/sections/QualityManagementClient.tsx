'use client';

import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ChevronDown, Award, Download } from 'lucide-react';

interface Certificate {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  file: string;
  icon: typeof Award;
}

const certificates: Certificate[] = [
  {
    id: 1,
    title: 'Сертификат качества',
    subtitle: 'Certificate of Quality MOTIT-Q-001',
    description: 'Подтверждает соответствие высшим стандартам управления качеством IT-услуг. Действителен до 31.12.2026.',
    file: '/documents/certificate-1.pdf',
    icon: Award,
  },
  {
    id: 2,
    title: 'ISO 9001:2015',
    subtitle: 'ISO 9001:2015 Compliance MOTIT-ISO-001',
    description: 'Соответствие требованиям международного стандарта системы менеджмента качества. Действителен до 31.12.2027.',
    file: '/documents/certificate-2.pdf',
    icon: ShieldCheck,
  },
];

export default function QualityManagementClient() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Лёгкая анимация появления
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const isSlowDevice = 
      (navigator.hardwareConcurrency || 8) <= 4 ||
      window.innerWidth < 480;

    if (isSlowDevice) {
      section.style.opacity = '1';
      section.style.transform = 'none';
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

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="reveal reveal-d2" style={{ opacity: 1 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl p-5 md:p-6 text-left cursor-pointer transition-all duration-300"
        style={{
          backgroundColor: '#0f2832',
          border: `1.5px solid ${isOpen ? 'rgba(45, 212, 191, 0.3)' : 'rgba(45, 212, 191, 0.15)'}`,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(45, 212, 191, 0.12)' }}
          >
            <Award size={22} style={{ color: '#2dd4bf' }} />
          </div>
          <div>
            <h3 className="font-semibold text-base md:text-lg" style={{ color: '#e0f7fa' }}>
              Сертификаты качества
            </h3>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(128, 222, 234, 0.6)' }}>
              {certificates.length} документа
            </p>
          </div>
        </div>
        <ChevronDown
          size={22}
          className="flex-shrink-0 transition-transform duration-300"
          style={{ color: '#2dd4bf', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* CSS-анимация открытия/закрытия */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: isOpen ? '500px' : '0',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {certificates.map((cert) => {
            const Icon = cert.icon;
            return (
              <a
                key={cert.id}
                href={cert.file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col rounded-xl p-5 transition-all duration-150 hover:-translate-y-1 group"
                style={{
                  backgroundColor: '#0f2832',
                  border: '1.5px solid rgba(45, 212, 191, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)';
                  e.currentTarget.style.backgroundColor = '#153541';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.1)';
                  e.currentTarget.style.backgroundColor = '#0f2832';
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(45, 212, 191, 0.1)' }}
                  >
                    <Icon size={20} style={{ color: '#2dd4bf' }} />
                  </div>
                  <Download
                    size={18}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{ color: 'rgba(128, 222, 234, 0.5)' }}
                  />
                </div>
                <h4 className="font-semibold text-base mb-1" style={{ color: '#e0f7fa' }}>
                  {cert.title}
                </h4>
                <p className="text-xs mb-2" style={{ color: '#2dd4bf' }}>
                  {cert.subtitle}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.6)' }}>
                  {cert.description}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}