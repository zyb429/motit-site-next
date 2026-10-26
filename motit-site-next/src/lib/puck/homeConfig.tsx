import type { Config } from "@puckeditor/core";
import Hero, { type HeroProps } from "@/components/sections/Hero";
import Directions, { type DirectionsProps } from "@/components/sections/Directions";
import CallToAction, { type CallToActionProps } from "@/components/sections/CallToAction";
import About, { type AboutProps } from "@/components/sections/About";
import WhyChooseUs, { type WhyChooseUsProps } from "@/components/sections/WhyChooseUs";
import Advantages, { type AdvantagesProps } from "@/components/sections/Advantages";
import KeyServices, { type KeyServicesProps } from "@/components/sections/KeyServices";
import Partners from "@/components/sections/Partners";
import FAQ, { type FAQProps } from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import QualityManagement, { type QualityManagementProps } from "@/components/sections/QualityManagement";

type Empty = Record<string, never>;

type HomeConfig = {
  Hero: HeroProps;
  Directions: DirectionsProps;
  CallToAction: CallToActionProps;
  About: AboutProps;
  WhyChooseUs: WhyChooseUsProps,
  Advantages: AdvantagesProps;
  KeyServices: KeyServicesProps;
  Partners: Empty;
  FAQ: FAQProps;
  Contact: Empty;
  QualityManagement: QualityManagementProps;
};

const wrap = (Cmp: React.ComponentType<any>, label: string) => ({
  fields: {}, defaultProps: {}, render: () => <Cmp />, label,
});

export const homeConfig: Config<HomeConfig> = {
  components: {
    Hero: {
      fields: {
        label: { type: "text" }, title: { type: "text" }, subtitle: { type: "text" },
        desc: { type: "textarea" }, ctaLabel: { type: "text" }, ctaHref: { type: "text" },
        imageUrl: { type: "text" },
      },
      defaultProps: {
        label: "IT-РЕШЕНИЯ ДЛЯ БИЗНЕСА", title: "МОТИТ", subtitle: "Ваш надежный IT-партнер",
        desc: "Предоставляем полный спектр IT-услуг для бизнеса любого масштаба. От технической поддержки до комплексной защиты инфраструктуры.",
        ctaLabel: "Наши направления", ctaHref: "#directions", imageUrl: null,
      },
      render: (props) => <Hero {...props} />,
    },
    Directions: {
      fields: {
        label: { type: "text" }, title: { type: "text" }, subtitle: { type: "textarea" },
        items: {
          type: "array", label: "Направления",
          arrayFields: {
            icon: { type: "select", label: "Иконка", options: [
              { label: "Наушники", value: "headphones" }, { label: "Щит", value: "shield" },
              { label: "Клипборд", value: "clipboard" }, { label: "Баг", value: "bug" },
              { label: "Дом", value: "home" }, { label: "Код", value: "code" },
              { label: "Глобус", value: "globe" }, { label: "Активность", value: "activity" },
              { label: "Щит-чек", value: "shieldcheck" }, { label: "Корзина", value: "cart" },
            ]},
            title: { type: "text" }, description: { type: "textarea" },
          },
          defaultItemProps: { icon: "headphones", title: "", description: "" },
          getItemSummary: (item) => item.title || "Направление",
        },
      },
      defaultProps: {
        label: "ЧТО МЫ ДЕЛАЕМ", title: "Наши направления",
        subtitle: "Полный спектр IT-услуг для вашего бизнеса — от консультаций до комплексного внедрения",
        items: [
          { icon: "headphones", title: "Техническая поддержка", description: "Круглосуточная помощь вашим пользователям. Решаем любые IT-проблемы быстро и эффективно." },
          { icon: "shield", title: "СЗИ", description: "Средства защиты информации для соответствия требованиям безопасности и регуляторных стандартов." },
          { icon: "clipboard", title: "Аудит, проектирование, создание и аттестация", description: "Полный цикл работ с ИТ-инфраструктурой — от аудита до официальной аттестации систем." },
          { icon: "bug", title: "Пентест", description: "Тестирование на проникновение для выявления уязвимостей до того, как их найдут злоумышленники." },
          { icon: "home", title: "Умный дом", description: "Проектирование и внедрение систем умного дома и автоматизации для офисов и жилых помещений." },
          { icon: "code", title: "Разработка программного обеспечения", description: "Создание индивидуальных программных решений под задачи вашего бизнеса." },
          { icon: "globe", title: "Разработка и поддержка сайтов", description: "Полный спектр услуг по созданию, развитию и технической поддержке веб-ресурсов." },
          { icon: "activity", title: "SOAR and SIEM", description: "Автоматизация реагирования на инциденты и централизованный мониторинг безопасности." },
          { icon: "shieldcheck", title: "Антивирусная защита", description: "Комплексная защита от вредоносных программ с использованием лучших решений на рынке." },
          { icon: "cart", title: "Продажа продуктов", description: "Поставка лицензионного программного обеспечения, оборудования и IT-решений." },
        ],
      },
      render: (props) => <Directions {...props} />,
    },
    CallToAction: {
      fields: {
        label: { type: "text" }, title: { type: "text" }, desc: { type: "textarea" },
        listItems: {
          type: "array", label: "Список",
          arrayFields: { text: { type: "text" } },
          defaultItemProps: { text: "" },
          getItemSummary: (item) => item.text || "Пункт",
        },
        ctaLabel: { type: "text" }, ctaHref: { type: "text" },
        secondaryLabel: { type: "text" }, secondaryHref: { type: "text" },
        imageUrl: { type: "text" },
      },
      defaultProps: {
        label: "НАЧНИТЕ С НАМИ", title: "Готовы улучшить вашу IT-инфраструктуру?",
        desc: "Наши специалисты проведут бесплатную консультацию и подготовят персональное предложение под задачи вашего бизнеса. Мы работаем с компаниями любого масштаба.",
        listItems: [{ text: "Бесплатная консультация" }, { text: "Индивидуальный подход" }, { text: "Работаем по всей Беларуси" }],
        ctaLabel: "Связаться", ctaHref: "#contact", secondaryLabel: "Техподдержка", secondaryHref: "https://help.motit.by", imageUrl: "/images/cta-image.jpg",
      },
      render: (props) => <CallToAction {...props} />,
    },
    About: {
      fields: {
        label: { type: "text" }, title: { type: "text" }, text1: { type: "textarea" }, text2: { type: "textarea" },
        buttonLabel: { type: "text" }, buttonHref: { type: "text" }, imageUrl: { type: "text" },
      },
      defaultProps: {
        label: "КТО МЫ", title: "МОТИТ — комплексные IT-решения для бизнеса",
        text1: "Мы — команда профессионалов с многолетним опытом в сфере информационных технологий. Начиная с технической поддержки и заканчивая сложными проектами по кибербезопасности, мы сопровождаем наших клиентов на каждом этапе цифровой трансформации.",
        text2: "Наши клиенты — это компании разных отраслей и масштабов, которые доверяют нам свою IT-инфраструктуру. Мы гордимся долгосрочными партнерствами, построенными на доверии, прозрачности и результате.",
        buttonLabel: "Смотреть направления", buttonHref: "#directions", imageUrl: "/images/about-image.jpg",
      },
      render: (props) => <About {...props} />,
    },
    WhyChooseUs: {
        fields: {
            label: { type: "text", label: "Метка" },
            title: { type: "text", label: "Заголовок" },
            subtitle: { type: "textarea", label: "Подзаголовок" },
            items: {
            type: "array",
            label: "Компетенции",
            arrayFields: {
                title: { type: "text", label: "Заголовок" },
                subtitle: { type: "text", label: "Подзаголовок" },
                description: { type: "textarea", label: "Описание" },
                image: { type: "text", label: "Картинка (URL)" },
            },
            defaultItemProps: { title: "", subtitle: "", description: "", image: "" },
            getItemSummary: (item) => item.title || "Компетенция",
            },
        },
        defaultProps: {
            label: "НАШИ КОМПЕТЕНЦИИ",
            title: "Экспертиза в ключевых областях",
            subtitle: "Глубокие знания и практический опыт в каждом направлении",
            items: [
            {
                title: "Сетевое администрирование",
                subtitle: "Профессиональный подход к сетям",
                description: "Проектируем, настраиваем и обслуживаем корпоративные сети любой сложности. Мониторинг 24/7, оперативное устранение неисправностей, регулярное обновление оборудования.",
                image: "/images/acc-network.jpg",
            },
            {
                title: "Информационная безопасность",
                subtitle: "Комплексная защита данных",
                description: "Аудит безопасности, внедрение СЗИ, тестирование на проникновение, подготовка к аттестации. Мы защищаем ваши данные на всех уровнях инфраструктуры.",
                image: "/images/acc-security.jpg",
            },
            {
                title: "Обслуживание техники",
                subtitle: "Ремонт и обслуживание оборудования",
                description: "Ремонт компьютеров, серверов и оргтехники. Профилактическое обслуживание, замена комплектующих, консультации по выбору техники.",
                image: "/images/acc-repair.jpg",
            },
            {
                title: "Мониторинг и SIEM",
                subtitle: "Контроль и анализ событий",
                description: "Настройка систем мониторинга и SIEM-платформ для своевременного обнаружения угроз и инцидентов. Автоматизация реагирования с помощью SOAR.",
                image: "/images/acc-monitoring.jpg",
            },
            ],
        },
        render: (props) => <WhyChooseUs {...props} />,
    },
    Advantages: {
      fields: {
        label: { type: "text" }, title: { type: "text" }, subtitle: { type: "textarea" },
        items: {
          type: "array", label: "Преимущества",
          arrayFields: {
            icon: { type: "select", label: "Иконка", options: [
              { label: "Люди", value: "users" }, { label: "Цель", value: "target" },
              { label: "Процессор", value: "cpu" }, { label: "Часы", value: "clock" },
              { label: "Наушники", value: "headphones" }, { label: "Награда", value: "award" },
            ]},
            title: { type: "text" }, description: { type: "textarea" },
          },
          defaultItemProps: { icon: "users", title: "", description: "" },
          getItemSummary: (item) => item.title || "Преимущество",
        },
      },
      defaultProps: {
        label: "ПОЧЕМУ МЫ", title: "Преимущества работы с нами",
        subtitle: "Мы строим долгосрочные партнерства, основанные на доверии и результате",
        items: [
          { icon: "users", title: "Профессиональная команда", description: "Наши специалисты имеют многолетний опыт в сфере информационных технологий. Сертифицированные эксперты по кибербезопасности, сетевому администрированию и разработке ПО готовы решить задачи любой сложности." },
          { icon: "target", title: "Индивидуальный подход", description: "Мы изучаем специфику вашего бизнеса и предлагаем решения, которые идеально соответствуют вашим задачам и бюджету. Никаких шаблонных решений — только персональная стратегия." },
          { icon: "cpu", title: "Современные технологии", description: "Работаем с передовыми технологиями и программными продуктами ведущих мировых вендоров. Постоянно следим за трендами и внедряем инновации, чтобы ваш бизнес был на шаг впереди." },
          { icon: "clock", title: "Оперативная реакция", description: "Среднее время реагирования на критические инциденты — от 15 минут. Наша служба поддержки работает круглосуточно, чтобы ваши системы функционировали без перебоев." },
          { icon: "headphones", title: "Полный цикл услуг", description: "От консультации до внедрения и дальнейшей поддержки — мы сопровождаем клиентов на всех этапах. Одно окно для всех IT-запросов экономит ваше время и ресурсы." },
          { icon: "award", title: "Гарантия качества", description: "Предоставляем гарантии на все выполненные работы и внедренные решения. Регулярный мониторинг и отчетность позволяют отслеживать эффективность наших услуг в реальном времени." },
        ],
      },
      render: (props) => <Advantages {...props} />,
    },
    KeyServices: {
    fields: {
        label: { type: "text", label: "Метка" },
        title: { type: "text", label: "Заголовок" },
        subtitle: { type: "textarea", label: "Подзаголовок" },
        items: {
        type: "array",
        label: "Услуги",
        arrayFields: {
            number: { type: "text", label: "Номер (01, 02, 03)" },
            title: { type: "text", label: "Заголовок" },
            shortDesc: { type: "textarea", label: "Краткое описание" },
            fullDesc: { type: "textarea", label: "Полное описание" },
        },
        defaultItemProps: { number: "", title: "", shortDesc: "", fullDesc: "" },
        getItemSummary: (item) => item.title || "Услуга",
        },
    },
    defaultProps: {
        label: "КЛЮЧЕВЫЕ УСЛУГИ",
        title: "Специализированные решения",
        subtitle: "Глубокая экспертиза в приоритетных направлениях IT-безопасности",
        items: [
        {
            number: "01",
            title: "SOAR и SIEM",
            shortDesc: "Внедрение систем корреляции событий и автоматического реагирования на инциденты безопасности. Централизованный мониторинг всех источников данных в реальном времени.",
            fullDesc: "Интегрируем платформы SIEM для сбора и анализа событий безопасности из всех источников вашей инфраструктуры. Настраиваем SOAR для автоматизации реагирования на инциденты, что сокращает время реакции с часов до минут. Включает настройку правил корреляции, дашбордов, оповещений и интеграцию с существующими системами защиты.",
        },
        {
            number: "02",
            title: "Антивирусная защита",
            shortDesc: "Развертывание и управление корпоративными антивирусными решениями. Защита рабочих станций, серверов и мобильных устройств от всех типов угроз.",
            fullDesc: "Поставляем и настраиваем корпоративные антивирусные решения ведущих вендоров (Kaspersky, ESET, Trend Micro и др.). Обеспечиваем централизованное управление политиками защиты, регулярное обновление баз, мониторинг состояния защиты и оперативное реагирование на обнаруженные угрозы. Включает защиту рабочих станций, серверов, почтовых систем и мобильных устройств.",
        },
        {
            number: "03",
            title: "Сетевое оборудование",
            shortDesc: "Поставка, настройка и обслуживание сетевого оборудования ведущих производителей. Проектирование отказоустойчивых сетевых инфраструктур.",
            fullDesc: "Подбираем, поставляем и настраиваем сетевое оборудование от ведущих производителей: коммутаторы, маршрутизаторы, точки доступа Wi-Fi, файрволы, системы IPS/IDS. Проектируем сетевую архитектуру с учётом требований к производительности, безопасности и отказоустойчивости. Предоставляем гарантийное и постгарантийное обслуживание.",
        },
        ],
    },
    render: (props) => <KeyServices {...props} />,
    },
    Partners: wrap(Partners, "Partners"),
    FAQ: {
      fields: {
        label: { type: "text" }, title: { type: "text" }, subtitle: { type: "textarea" },
        items: {
          type: "array", label: "Вопросы",
          arrayFields: {
            tag: { type: "text" }, question: { type: "text" }, answer: { type: "textarea" },
          },
          defaultItemProps: { tag: "", question: "", answer: "" },
          getItemSummary: (item) => item.question || "Вопрос",
        },
      },
      defaultProps: {
        label: "FAQ", title: "Частые вопросы",
        subtitle: "Отвечаем на самые популярные вопросы. Не нашли ответ? Свяжитесь с нами.",
        items: [
          { tag: "Услуги", question: "Какие услуги вы предоставляете?", answer: "Мы предоставляем полный спектр IT-услуг: техническую поддержку, настройку и администрирование сетей, информационную безопасность, поставку оборудования и ПО, разработку программного обеспечения и сайтов, умный дом и многое другое. Полный список — в разделе \"Наши направления\"." },
          { tag: "Скорость", question: "Как быстро вы реагируете на запросы?", answer: "Мы реагируем на критические инциденты в течение 15 минут. Стандартные запросы обрабатываются в течение нескольких часов. Режим работы: пн–пт, 9:00–18:00. Для клиентов с SLA доступна круглосуточная поддержка." },
          { tag: "Клиенты", question: "С какими компаниями вы работаете?", answer: "Мы работаем с организациями любого размера — от небольших офисов до крупных корпораций. Наши клиенты представляют различные отрасли: финансы, производство, образование, медицина, торговля и государственный сектор." },
          { tag: "Поддержка", question: "Как связаться с вашей техподдержкой?", answer: "Вы можете оставить заявку через портал help.motit.by, позвонить по номеру +375 (29) 118-50-82 или отправить письмо на info@motit.by. Наши специалисты свяжутся с вами в кратчайшие сроки." },
          { tag: "География", question: "Работаете ли вы в регионах Беларуси?", answer: "Да, мы работаем по всей Беларуси. Большая часть работ может быть выполнена удаленно. При необходимости выезда наших специалистов — договариваемся индивидуально." },
        ],
      },
      render: (props) => <FAQ {...props} />,
    },
    Contact: wrap(Contact, "Contact"),
    QualityManagement: {
      fields: {
        label: { type: "text" }, title: { type: "text" }, subtitle: { type: "textarea" },
        policyTitle: { type: "text" }, policyDesc: { type: "text" }, policyHref: { type: "text" },
        certificates: {
          type: "array", label: "Сертификаты",
          arrayFields: {
            title: { type: "text" }, subtitle: { type: "text" }, description: { type: "textarea" },
            file: { type: "text" }, icon: { type: "select", options: [
              { label: "Award", value: "award" }, { label: "Shield", value: "shield" },
            ]},
          },
          defaultItemProps: { title: "", subtitle: "", description: "", file: "", icon: "award" },
          getItemSummary: (item) => item.title || "Сертификат",
        },
      },
      defaultProps: {
        label: "СТАНДАРТЫ", title: "Менеджмент качества",
        subtitle: "Подтверждённое соответствие международным стандартам и внутренним регламентам качества",
        policyTitle: "Политика в области качества", policyDesc: "Официальный документ компании", policyHref: "/documents/policy-quality.pdf",
        certificates: [
          { title: "Сертификат качества", subtitle: "Certificate of Quality MOTIT-Q-001", description: "Подтверждает соответствие высшим стандартам управления качеством IT-услуг. Действителен до 31.12.2026.", file: "/documents/certificate-1.pdf", icon: "award" },
          { title: "ISO 9001:2015", subtitle: "ISO 9001:2015 Compliance MOTIT-ISO-001", description: "Соответствие требованиям международного стандарта системы менеджмента качества. Действителен до 31.12.2027.", file: "/documents/certificate-2.pdf", icon: "shield" },
        ],
      },
      render: (props) => <QualityManagement {...props} />,
    },
  },
};