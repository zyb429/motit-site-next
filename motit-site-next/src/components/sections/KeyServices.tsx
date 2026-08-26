import KeyServicesClient from './KeyServicesClient';

export default function KeyServices() {
  return (
    <section className="section-padding" style={{ backgroundColor: '#0d2029' }}>
      <div className="content-container">
        <div className="mb-10 md:mb-14">
          <span className="section-label block mb-3">КЛЮЧЕВЫЕ УСЛУГИ</span>
          <h2 className="section-title mb-4">Специализированные решения</h2>
          <p className="section-subtitle max-w-[560px]">Глубокая экспертиза в приоритетных направлениях IT-безопасности</p>
        </div>

        {/* Клиентский компонент с карточками */}
        <KeyServicesClient />
      </div>
    </section>
  );
}