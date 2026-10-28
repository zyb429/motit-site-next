'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, ExternalLink, ShieldCheck, ChevronDown, Award, Download } from 'lucide-react';

export type CertificateFile =
  | string
  | { url: string; fileId?: number; name?: string }
  | null;

export type QualityManagementProps = {
  label: string;
  title: string;
  subtitle: string;
  policyTitle: string;
  policyDesc: string;
  policyHref: CertificateFile;
  certificates: Array<{
    title: string;
    subtitle: string;
    description: string;
    file: CertificateFile;
    icon: 'award' | 'shield';
    expiryDate: string;
  }>;
  puck?: { isEditing?: boolean };
};

const ICONS = { award: Award, shield: ShieldCheck } as const;

function resolveFileUrl(file: CertificateFile): string {
  if (!file) return '';
  if (typeof file === 'string') return file;
  return file.url ?? '';
}

export default function QualityManagement({
  label,
  title,
  subtitle,
  policyTitle,
  policyDesc,
  policyHref,
  certificates,
  puck,
}: QualityManagementProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const inEditor = puck?.isEditing ?? false;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (inEditor) return;

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [inEditor]);

  const opened = inEditor || isOpen;
  const policyUrl = resolveFileUrl(policyHref);

  return (
    <section className="section-padding" style={{ backgroundColor: '#0d2029' }}>
      <div className="content-container max-w-[900px]">
        <div className="text-center mb-6 md:mb-8">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4">{title}</h2>
          <p className="section-subtitle max-w-[560px] mx-auto">{subtitle}</p>
        </div>

        {policyTitle && (
          <div className="mb-4">
            <a
              href={policyUrl || '#'}
              onClick={(e) => { if (!policyUrl) e.preventDefault(); }}
              target={policyUrl ? '_blank' : undefined}
              rel={policyUrl ? 'noopener noreferrer' : undefined}
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
                    {policyTitle}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: 'rgba(128, 222, 234, 0.6)' }}>
                    {policyDesc}
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
        )}

        {(certificates ?? []).length > 0 && (
          <div ref={sectionRef} className="reveal reveal-d2" style={{ opacity: 1 }}>
            <button
              onClick={() => !inEditor && setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between rounded-xl p-5 md:p-6 text-left cursor-pointer transition-all duration-300"
              style={{
                backgroundColor: '#0f2832',
                border: `1.5px solid ${opened ? 'rgba(45, 212, 191, 0.3)' : 'rgba(45, 212, 191, 0.15)'}`,
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
                style={{
                  color: '#2dd4bf',
                  transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-out"
              style={{ maxHeight: opened ? '2000px' : '0', opacity: opened ? 1 : 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {certificates.map((cert, i) => {
                  const Icon = ICONS[cert.icon] ?? Award;
                  const fileUrl = resolveFileUrl(cert.file);
                  const Wrapper = fileUrl ? 'a' : 'div';
                  const wrapperProps = fileUrl
                    ? {
                        href: fileUrl,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      }
                    : {};
                  return (
                    <Wrapper
                      key={i}
                      {...wrapperProps}
                      className="flex flex-col rounded-xl p-5 transition-all duration-150 hover:-translate-y-1 group"
                      style={{ backgroundColor: '#0f2832', border: '1.5px solid rgba(45, 212, 191, 0.1)' }}
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
                      {cert.expiryDate && (
                        <p className="text-xs mt-2" style={{ color: 'rgba(128, 222, 234, 0.5)' }}>
                          Действителен до{' '}
                          {new Date(cert.expiryDate).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </Wrapper>
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