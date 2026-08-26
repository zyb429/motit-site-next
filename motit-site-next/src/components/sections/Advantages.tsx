// Серверный компонент — рендерится на сервере
import AdvantagesClient from './AdvantagesClient';

export default function Advantages() {
  return (
    <section className="section-padding" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container">
        <div className="mb-12 md:mb-16">
          <span className="section-label block mb-3">ПОЧЕМУ МЫ</span>
          <h2 className="section-title mb-4">Преимущества работы с нами</h2>
          <p className="section-subtitle max-w-[600px]">Мы строим долгосрочные партнерства, основанные на доверии и результате</p>
        </div>
        
        {/* Клиентский компонент для анимаций */}
        <AdvantagesClient />
      </div>
    </section>
  );
}