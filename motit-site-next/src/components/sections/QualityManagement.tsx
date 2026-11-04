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
    <section className="section-padding bg-(--bg-secondary) transition-colors duration-300">
      <div className="content-container max-w-[900px]">
        <div className="text-center mb-6 md:mb-8">
          <span className="section-label block mb-3">{label}</span>
          <h2 className="section-title mb-4 text-(--text-primary)">{title}</h2>
          <p className="section-subtitle max-w-[560px] mx-auto text-(--text-secondary)">{subtitle}</p>
        </div>

        {policyTitle && (
          <div className="mb-4">
            <a
              href={policyUrl || '#'}
              onClick={(e) => { if (!policyUrl) e.preventDefault(); }}
              target={policyUrl ? '_blank' : undefined}
              rel={policyUrl ? 'noopener noreferrer' : undefined}
              className="flex items-center justify-between rounded-xl p-5 md:p-6 transition-all duration-150 hover:-translate-y-1 bg-(--bg-card) border border-(--border) border-l-[3px] border-l-(--accent)"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-(--accent-dim)">
                  <FileText size={22} className="text-(--accent)" />
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg text-(--text-primary)">
                    {policyTitle}
                  </h3>
                  <p className="text-sm mt-0.5 text-(--text-muted)">
                    {policyDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <ExternalLink size={16} className="text-(--accent)" />
                <span className="text-sm font-medium hidden sm:inline text-(--accent)">
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
              className={`w-full flex items-center justify-between rounded-xl p-5 md:p-6 text-left cursor-pointer transition-all duration-300 bg-(--bg-card) border ${opened ? 'border-(--accent)' : 'border-(--border)'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-(--accent-dim)">
                  <Award size={22} className="text-(--accent)" />
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg text-(--text-primary)">
                    Сертификаты качества
                  </h3>
                  <p className="text-sm mt-0.5 text-(--text-muted)">
                    {certificates.length} документа
                  </p>
                </div>
              </div>
              <ChevronDown
                size={22}
                className="flex-shrink-0 transition-transform duration-300 text-(--accent)"
                style={{
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
                      className="flex flex-col rounded-xl p-5 transition-all duration-150 hover:-translate-y-1 group bg-(--bg-card) border border-(--border)"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-(--accent-dim)">
                          <Icon size={20} className="text-(--accent)" />
                        </div>
                        <Download
                          size={18}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-(--text-muted)"
                        />
                      </div>
                      <h4 className="font-semibold text-base mb-1 text-(--text-primary)">
                        {cert.title}
                      </h4>
                      <p className="text-xs mb-2 text-(--accent)">
                        {cert.subtitle}
                      </p>
                      <p className="text-sm leading-relaxed text-(--text-secondary)">
                        {cert.description}
                      </p>
                      {cert.expiryDate && (
                        <p className="text-xs mt-2 text-(--text-muted)">
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