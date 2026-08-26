// Серверный компонент — рендерится на сервере (SSR)
import WhyChooseUsClient from "./WhyChooseUsClient";

export default function WhyChooseUs() {
  return (
    <section className="section-padding" style={{ backgroundColor: "#0a1920" }}>
      <div className="content-container max-w-225">
        <div className="mb-10 md:mb-12 text-center">
          <span className="section-label block mb-3">НАШИ КОМПЕТЕНЦИИ</span>
          <h2 className="section-title mb-4">Экспертиза в ключевых областях</h2>
          <p className="section-subtitle max-w-140 mx-auto">
            Глубокие знания и практический опыт в каждом направлении
          </p>
        </div>

        {/* Клиентский компонент с аккордеоном */}
        <WhyChooseUsClient />
      </div>
    </section>
  );
}
