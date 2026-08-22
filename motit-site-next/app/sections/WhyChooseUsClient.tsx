"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";

const accordionItems = [
  {
    title: "Сетевое администрирование",
    subtitle: "Профессиональный подход к сетям",
    description:
      "Проектируем, настраиваем и обслуживаем корпоративные сети любой сложности. Мониторинг 24/7, оперативное устранение неисправностей, регулярное обновление оборудования.",
    image: "/images/acc-network.jpg",
  },
  {
    title: "Информационная безопасность",
    subtitle: "Комплексная защита данных",
    description:
      "Аудит безопасности, внедрение СЗИ, тестирование на проникновение, подготовка к аттестации. Мы защищаем ваши данные на всех уровнях инфраструктуры.",
    image: "/images/acc-security.jpg",
  },
  {
    title: "Обслуживание техники",
    subtitle: "Ремонт и обслуживание оборудования",
    description:
      "Ремонт компьютеров, серверов и оргтехники. Профилактическое обслуживание, замена комплектующих, консультации по выбору техники.",
    image: "/images/acc-repair.jpg",
  },
  {
    title: "Мониторинг и SIEM",
    subtitle: "Контроль и анализ событий",
    description:
      "Настройка систем мониторинга и SIEM-платформ для своевременного обнаружения угроз и инцидентов. Автоматизация реагирования с помощью SOAR.",
    image: "/images/acc-monitoring.jpg",
  },
];

export default function WhyChooseUsClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Лёгкая анимация появления
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const isSlowDevice =
      (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 480;

    if (isSlowDevice) {
      section.style.opacity = "1";
      section.style.transform = "none";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="reveal flex flex-col gap-3"
      style={{ opacity: 1 }}
    >
      {accordionItems.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-xl overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: "#0f2832",
              border: `1px solid ${isOpen ? "rgba(45, 212, 191, 0.3)" : "rgba(45, 212, 191, 0.08)"}`,
              borderLeft: isOpen
                ? "3px solid #2dd4bf"
                : "3px solid transparent",
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer"
            >
              <h4
                className="font-semibold leading-snug pr-4 transition-colors duration-300"
                style={{
                  fontSize: "clamp(1.1rem, 1.6vw, 1.35rem)",
                  color: isOpen ? "#2dd4bf" : "#e0f7fa",
                }}
              >
                {item.title}
              </h4>
              <Plus
                size={22}
                className="shrink-0 transition-transform duration-300"
                style={{
                  color: isOpen ? "#2dd4bf" : "rgba(128, 222, 234, 0.5)",
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* CSS-анимация открытия/закрытия */}
            <div
              className="overflow-hidden transition-all duration-300 ease-out"
              style={{
                maxHeight: isOpen ? "500px" : "0",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="px-5 md:px-6 pb-5 md:pb-6 flex flex-col md:flex-row gap-5">
                <div className="md:w-[38%]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full aspect-video object-cover rounded-xl"
                    loading="lazy"
                    style={{ opacity: 1 }}
                  />
                </div>
                <div className="md:w-[62%]">
                  <h5
                    className="font-semibold mb-2"
                    style={{ color: "#2dd4bf", fontSize: "1.05rem" }}
                  >
                    {item.subtitle}
                  </h5>
                  <p
                    className="text-sm md:text-base leading-relaxed"
                    style={{ color: "rgba(128, 222, 234, 0.7)" }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
