import { FileText, ExternalLink } from 'lucide-react';
import QualityManagementClient from './QualityManagementClient';

export default function QualityManagement() {
  return (
    <section className="section-padding" style={{ backgroundColor: '#0d2029' }}>
      <div className="content-container max-w-[900px]">
        <div className="text-center mb-10 md:mb-12">
          <span className="section-label block mb-3">СТАНДАРТЫ</span>
          <h2 className="section-title mb-4">Менеджмент качества</h2>
          <p className="section-subtitle max-w-[560px] mx-auto">
            Подтверждённое соответствие международным стандартам и внутренним регламентам качества
          </p>
        </div>

        {/* Policy Link — серверный */}
        <div className="mb-6">
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

        {/* Клиентский компонент с аккордеоном сертификатов */}
        <QualityManagementClient />
      </div>
    </section>
  );
}