import {
  Link as Linkedin,
  Send,
  Mail,
  Headphones,
  Phone,
  MapPin,
} from "lucide-react";
import FooterClient from "./FooterClient";

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: "#0d2029",
        borderColor: "rgba(45, 212, 191, 0.08)",
      }}
    >
      <div className="content-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Company Info */}
          <div>
            <span
              className="text-xl font-bold tracking-tight block mb-3"
              style={{ color: "#e0f7fa" }}
            >
              МОТИТ
            </span>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "rgba(128, 222, 234, 0.6)" }}
            >
              Ваш надежный IT-партнер. Полный спектр IT-услуг для бизнеса любого
              масштаба.
            </p>
            <div className="flex gap-3">
              {[
                {
                  icon: Linkedin,
                  href: "https://linkedin.com",
                  label: "LinkedIn",
                },
                { icon: Send, href: "https://t.me/motit", label: "Telegram" },
                {
                  icon: Headphones,
                  href: "https://help.motit.by",
                  label: "Поддержка",
                  ext: true,
                },
              ].map(({ icon: Icon, href, label, ext }) => (
                <a
                  key={label}
                  href={href}
                  target={ext ? "_blank" : undefined}
                  rel={ext ? "noopener noreferrer" : undefined}
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-150 hover:border-[#2dd4bf] hover:text-[#2dd4bf]"
                  style={{
                    borderColor: "rgba(45, 212, 191, 0.1)",
                    color: "rgba(128, 222, 234, 0.6)",
                  }}
                  aria-label={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (клиентский для плавной прокрутки) */}
          <FooterClient />

          {/* Contacts */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "#e0f7fa" }}
            >
              Контакты
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+375291185082"
                className="flex items-center gap-2 text-sm transition-colors duration-100 hover:text-[#2dd4bf]"
                style={{ color: "rgba(128, 222, 234, 0.6)" }}
              >
                <Phone size={14} /> +375 (29) 118-50-82
              </a>
              <a
                href="mailto:info@motit.by"
                className="flex items-center gap-2 text-sm transition-colors duration-100 hover:text-[#2dd4bf]"
                style={{ color: "rgba(128, 222, 234, 0.6)" }}
              >
                <Mail size={14} /> info@motit.by
              </a>
              <div
                className="flex items-center gap-2 text-sm whitespace-nowrap"
                style={{ color: "rgba(128, 222, 234, 0.6)" }}
              >
                <MapPin size={14} className="flex-shrink-0" />
                <span>г. Минск, ул. Сухаревская, д. 16, п. 71</span>
              </div>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "#e0f7fa" }}
            >
              Поддержка
            </h4>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "rgba(128, 222, 234, 0.6)" }}
            >
              Нужна помощь? Оставьте заявку в нашей системе техподдержки.
            </p>
            <a
              href="https://help.motit.by"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-2.5 px-4 text-xs inline-flex"
            >
              <Headphones size={14} className="mr-2" /> Техподдержка
            </a>
          </div>
        </div>

        <div
          className="border-t pt-8 text-center"
          style={{ borderColor: "rgba(45, 212, 191, 0.08)" }}
        >
          <p
            className="text-xs uppercase tracking-[0.05em]"
            style={{ color: "rgba(77, 208, 225, 0.45)" }}
          >
            &copy; 2025 МОТИТ. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
