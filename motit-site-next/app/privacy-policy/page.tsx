import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности | Motit",
  description: "Политика обработки персональных данных на сайте Motit",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-16" style={{ backgroundColor: "#0a1920" }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-[#0f2832] rounded-2xl p-8 md:p-12 border border-teal-500/10">
          <h1
            className="text-3xl md:text-4xl font-bold mb-8"
            style={{ color: "#e0f7fa" }}
          >
            Политика обработки персональных данных
          </h1>

          <div
            className="space-y-8"
            style={{ color: "rgba(128, 222, 234, 0.85)" }}
          >
            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "#2dd4bf" }}
              >
                1. Общие положения
              </h2>
              <p className="leading-relaxed">
                Настоящая политика обработки персональных данных (далее —
                Политика) действует в отношении всей информации, которую ООО
                "Мотит" (далее — Оператор) может получить о пользователе во
                время использования сайта motit.by.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "#2dd4bf" }}
              >
                2. Цели обработки персональных данных
              </h2>
              <p className="leading-relaxed mb-3">
                Оператор обрабатывает персональные данные пользователей в
                следующих целях:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Обработка заявок и обращений пользователей</li>
                <li>Предоставление информации об услугах и продуктах</li>
                <li>Заключение и исполнение договоров</li>
                <li>Проведение маркетинговых исследований</li>
                <li>Улучшение качества обслуживания</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "#2dd4bf" }}
              >
                3. Перечень обрабатываемых персональных данных
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Фамилия, имя, отчество</li>
                <li>Контактный телефон</li>
                <li>Адрес электронной почты</li>
                <li>Должность</li>
                <li>Информация о компании</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "#2dd4bf" }}
              >
                4. Правовые основания обработки
              </h2>
              <p className="leading-relaxed">
                Обработка персональных данных осуществляется на основании:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Согласия пользователя на обработку персональных данных</li>
                <li>Договорных отношений между Оператором и пользователем</li>
                <li>Требований законодательства Республики Беларусь</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "#2dd4bf" }}
              >
                5. Сроки обработки персональных данных
              </h2>
              <p className="leading-relaxed">
                Персональные данные хранятся не дольше, чем этого требуют цели
                их обработки, но не более 5 лет с момента последнего обращения
                пользователя, если иное не предусмотрено законодательством.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "#2dd4bf" }}
              >
                6. Права пользователя
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Получать информацию об обработке своих персональных данных
                </li>
                <li>Требовать уточнения или удаления персональных данных</li>
                <li>Отозвать согласие на обработку персональных данных</li>
                <li>Обжаловать действия Оператора в уполномоченные органы</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "#2dd4bf" }}
              >
                7. Контактная информация
              </h2>
              <div className="space-y-2">
                <p>
                  По вопросам обработки персональных данных вы можете
                  обратиться:
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a
                    href="mailto:info@motit.by"
                    className="text-teal-400 hover:underline"
                  >
                    info@motit.by
                  </a>
                </p>
                <p>
                  <span className="font-medium">Телефон:</span>{" "}
                  <a
                    href="tel:+375291185082"
                    className="text-teal-400 hover:underline"
                  >
                    +375 (29) 118-50-82
                  </a>
                </p>
                <p>
                  <span className="font-medium">Адрес:</span> г. Минск, ул.
                  Сухаревская, д. 16, п. 71
                </p>
              </div>
            </section>

            <section>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "#2dd4bf" }}
              >
                8. Изменение политики
              </h2>
              <p className="leading-relaxed">
                Оператор оставляет за собой право вносить изменения в настоящую
                Политику. Новая редакция вступает в силу с момента ее размещения
                на сайте, если иное не предусмотрено новой редакцией.
              </p>
              <p className="mt-4 text-sm opacity-70">
                Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
