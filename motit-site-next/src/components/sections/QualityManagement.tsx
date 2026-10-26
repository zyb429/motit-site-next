'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, ExternalLink, ShieldCheck, ChevronDown, Award, Download } from 'lucide-react';

export type QualityManagementProps = {
  label: string;
  title: string;
  subtitle: string;
  policyTitle: string;
  policyDesc: string;
  policyHref: string;
  certificates: Array<{ title: string; subtitle: string; description: string; file: string; icon: 'award' | 'shield' }>;
};

const ICONS = { award: Award, shield: ShieldCheck } as const;

export default function QualityManagement({ label, title, subtitle, policyTitle, policyDesc, policyHref, certificates }: QualityManagementProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (typeof document !== 'undefined' && document.querySelector('.Puck')) return;
    const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')), { threshold: 0.1 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-padding" style={{ backgroundColor: '#0d2029' }}>
      <div className="content-container max-w-[900px]">
        <div className="text-center mb-10 md:mb-12">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4">{title}</h2>
          <p className="section-subtitle max-w-[560px] mx-auto">{subtitle}</p>
        </div>
        {policyTitle && (
          <div className="mb-6">
            <a href={policyHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl p-5 md:p-6 transition-all duration-150 hover:-translate-y-1" style={{ backgroundColor: '#0f2832', border: '1.5px solid rgba(45, 212, 191, 0.15)', borderLeft: '3px solid #2dd4bf' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(45, 212, 191, 0.12)' }}><FileText size={22} style={{ color: '#2dd4bf' }} /></div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg" style={{ color: '#e0f7fa' }}>{policyTitle}</h3>
                  <p className="text-sm mt-0.5" style={{ color: 'rgba(128, 222, 234, 0.6)' }}>{policyDesc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4"><ExternalLink size={16} style={{ color: '#2dd4bf' }} /><span className="text-sm font-medium hidden sm:inline" style={{ color: '#2dd4bf' }}>Открыть</span></div>
            </a>
          </div>
        )}
        {(certificates ?? []).length > 0 && (
          <div ref={sectionRef} className="reveal reveal-d2" style={{ opacity: 1 }}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between rounded-xl p-5 md:p-6 text-left cursor-pointer transition-all duration-300" style={{ backgroundColor: '#0f2832', border: `1.5px solid ${isOpen ? 'rgba(45, 212, 191, 0.3)' : 'rgba(45, 212, 191, 0.15)'}` }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(45, 212, 191, 0.12)' }}><Award size={22} style={{ color: '#2dd4bf' }} /></div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg" style={{ color: '#e0f7fa' }}>Сертификаты качества</h3>
                  <p className="text-sm mt-0.5" style={{ color: 'rgba(128, 222, 234, 0.6)' }}>{certificates.length} документа</p>
                </div>
              </div>
              <ChevronDown size={22} className="flex-shrink-0 transition-transform duration-300" style={{ color: '#2dd4bf', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            <div className="overflow-hidden transition-all duration-300 ease-out" style={{ maxHeight: isOpen ? '2000px' : '0', opacity: isOpen ? 1 : 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {certificates.map((cert, i) => {
                  const Icon = ICONS[cert.icon] ?? Award;
                  return (
                    <a key={i} href={cert.file} target="_blank" rel="noopener noreferrer" className="flex flex-col rounded-xl p-5 transition-all duration-150 hover:-translate-y-1 group" style={{ backgroundColor: '#0f2832', border: '1.5px solid rgba(45, 212, 191, 0.1)' }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(45, 212, 191, 0.1)' }}><Icon size={20} style={{ color: '#2dd4bf' }} /></div>
                        <Download size={18} className="opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color: 'rgba(128, 222, 234, 0.5)' }} />
                      </div>
                      <h4 className="font-semibold text-base mb-1" style={{ color: '#e0f7fa' }}>{cert.title}</h4>
                      <p className="text-xs mb-2" style={{ color: '#2dd4bf' }}>{cert.subtitle}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.6)' }}>{cert.description}</p>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}