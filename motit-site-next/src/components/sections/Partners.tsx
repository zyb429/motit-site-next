import PartnersClient from './PartnersClient';

export default function Partners() {
  return (
    <section className="section-padding" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container">
        <div className="text-center mb-10 md:mb-14">
          <span className="section-label block mb-3">НАМ ДОВЕРЯЮТ</span>
          <h2 className="section-title mb-4">Наши партнеры</h2>
          <p className="section-subtitle max-w-[600px] mx-auto">Сотрудничаем с ведущими технологическими компаниями</p>
        </div>
      </div>

      {/* Клиентский компонент с каруселью */}
      <PartnersClient />

      <div className="text-center mt-10 md:mt-12">
        <p className="text-sm mb-3" style={{ color: 'rgba(128, 222, 234, 0.5)' }}>Хотите стать нашим партнером?</p>
        <a href="#contact" className="btn-ghost text-xs">Свяжитесь с нами</a>
      </div>
    </section>
  );
}