import DirectionsClient from "./DirectionsClient";

export default function Directions() {
  return (
    <section
      id="directions"
      className="section-padding"
      style={{ backgroundColor: "#0a1920" }}
    >
      <div className="content-container">
        <div className="mb-12 md:mb-16">
          <span className="section-label block mb-3">ЧТО МЫ ДЕЛАЕМ</span>
          <h2 className="section-title mb-4">Наши направления</h2>
          <p className="section-subtitle max-w-160">
            Полный спектр IT-услуг для вашего бизнеса — от консультаций до
            комплексного внедрения
          </p>
        </div>

        {/* Клиентский компонент сам содержит иконки */}
        <DirectionsClient />
      </div>
    </section>
  );
}
