'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useReveal } from '../hooks/useReveal';
import { ShieldCheck, ChevronDown, FileText, Award, Download, ExternalLink } from 'lucide-react';

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

export default function QualityManagement() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useReveal(sectionRef);

  useEffect(() => {
    if (!contentRef.current) return;
    if (isOpen) {
      gsap.set(contentRef.current, { height: 'auto', opacity: 1 });
      if (innerRef.current) {
        gsap.from(innerRef.current, { opacity: 0, y: 12, duration: 0.35, ease: 'power2.out' });
      }
    } else {
      gsap.to(contentRef.current, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.in' });
    }
  }, [isOpen]);

  return (
    <section ref={sectionRef} className="section-padding" style={{ backgroundColor: '#0d2029' }}>
      <div className="content-container max-w-[900px]">
        <div className="reveal text-center mb-10 md:mb-12">
          <span className="section-label block mb-3">СТАНДАРТЫ</span>
          <h2 className="section-title mb-4">Менеджмент качества</h2>
          <p className="section-subtitle max-w-[560px] mx-auto">
            Подтверждённое соответствие международным стандартам и внутренним регламентам качества
          </p>
        </div>

        {/* Policy Link */}
        <div className="reveal reveal-d1 mb-6">
          <a
            href="/documents/policy-quality.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl p-5 md:p-6 transition-all duration-150 hover:-translate-y-1"
            style={{
              backgroundColor: '#0f2832',
              border: '1.5px solid rgba(45, 212, 191, 0.15)',
              borderLeft: '3px solid #2dd4bf',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(45, 212, 191, 0.12)' }}
              >
                <FileText size={22} style={{ color: '#2dd4bf' }} />
              </div>
              <div>
                <h3 className="font-semibold text-base md:text-lg" style={{ color: '#e0f7fa' }}>
                  Политика в области качества
                </h3>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(128, 222, 234, 0.6)' }}>
                  Официальный документ компании
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <ExternalLink size={16} style={{ color: '#2dd4bf' }} />
              <span className="text-sm font-medium hidden sm:inline" style={{ color: '#2dd4bf' }}>
                Открыть
              </span>
            </div>
          </a>
        </div>

        {/* Certificates Accordion */}
        <div className="reveal reveal-d2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between rounded-xl p-5 md:p-6 text-left cursor-pointer transition-all duration-150"
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
              className="flex-shrink-0 transition-transform duration-200"
              style={{ color: '#2dd4bf', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          <div ref={contentRef} className="overflow-hidden">
            <div ref={innerRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
      </div>
    </section>
  );
}
