// src/app/contacts/page.tsx
import Contact from "@/components/sections/Contact";

export const metadata = {
  title: "Контакты — МОТИТ",
  description: "Свяжитесь с нами: телефон, email, адрес, форма заявки",
};

export default function ContactsPage() {
  return (
    <main>
      <Contact
        label="КОНТАКТЫ"
        title="Свяжитесь с нами"
        subtitle="Готовы обсудить ваши задачи и предложить оптимальное решение"
        contacts={[
          { icon: "phone", label: "Телефон", value: "+375 (29) 118-50-82", href: "tel:+375291185082" },
          { icon: "mail", label: "Email", value: "info@motit.by", href: "mailto:info@motit.by" },
          { icon: "map-pin", label: "Адрес", value: "г. Минск, ул. Сухаревская, д. 16, п. 71" },
          { icon: "clock", label: "Режим работы", value: "Пн–Пт: 9:00 – 18:00" },
        ]}
        privacyLabel="политикой конфиденциальности"
        privacyHref="/privacy-policy"
      />
    </main>
  );
}