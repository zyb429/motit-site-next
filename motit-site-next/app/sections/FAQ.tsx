// Серверный компонент — рендерится на сервере (SSR)
import FAQClient from './FAQClient';

export default function FAQ() {
  return (
    <section id="faq" className="section-padding" style={{ backgroundColor: '#0d2029' }}>
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-[0.3fr_0.7fr] gap-10 lg:gap-14">
          <div>
            <span className="section-label block mb-3">FAQ</span>
            <h2 className="section-title mb-4">Частые вопросы</h2>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: 'rgba(128, 222, 234, 0.7)' }}>
              Отвечаем на самые популярные вопросы. Не нашли ответ? Свяжитесь с нами.
            </p>
          </div>

          {/* Клиентский компонент с аккордеоном */}
          <FAQClient />
        </div>
      </div>
    </section>
  );
}