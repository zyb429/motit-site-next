"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

type Field = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string | null;
  options?: { label: string; value: string }[] | string | null;
};

const inputStyle = {
  backgroundColor: "#0f2832",
  border: "1.5px solid rgba(45, 212, 191, 0.2)",
  color: "#e0f7fa",
  fontSize: "16px",
};

const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = "#2dd4bf";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45, 212, 191, 0.1)";
};
const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.2)";
  e.currentTarget.style.boxShadow = "none";
};

export default function ContactClient({
  privacyLabel = "политикой конфиденциальности",
  privacyHref = "/privacy-policy",
  fields: initialFields = [],
}: {
  privacyLabel?: string;
  privacyHref?: string;
  fields?: Field[];
}) {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [privacyError, setPrivacyError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // 🔥 Загрузка полей, если они не переданы (например, на главной через Puck)
  useEffect(() => {
    if (initialFields && initialFields.length > 0) {
      setFields(initialFields);
      return;
    }

    let isMounted = true;
    setIsLoadingFields(true);

    fetch("/api/contact-fields")
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить поля");
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setFields(data);
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки полей формы:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingFields(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialFields]);

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
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("loading");
    setErrorMessage("");
    setPrivacyError("");

    if (!isPrivacyAgreed) {
      setFormState("error");
      setPrivacyError("Необходимо согласие на обработку персональных данных");
      setTimeout(() => {
        setFormState("idle");
        setPrivacyError("");
      }, 5000);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    for (const field of fields) {
      const v = formData.get(field.name);
      if (v) data[field.name] = String(v).trim();
    }

    // required-валидация
    for (const field of fields) {
      if (field.required && !data[field.name]) {
        setFormState("error");
        setErrorMessage(`Поле «${field.label}» обязательно`);
        setTimeout(() => setFormState("idle"), 3000);
        return;
      }
    }

    // email-валидация, если есть поле type=email
    const emailField = fields.find((f) => f.type === "email");
    if (emailField && data[emailField.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[emailField.name])) {
      setFormState("error");
      setErrorMessage("Введите корректный email");
      setTimeout(() => setFormState("idle"), 3000);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: data,
          privacyAgreed: isPrivacyAgreed,
          privacyAgreedAt: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Ошибка отправки");
      }

      setFormState("success");
      formRef.current?.reset();
      setIsPrivacyAgreed(false);

      setTimeout(() => setFormState("idle"), 4000);
    } catch (error) {
      console.error("Ошибка отправки:", error);
      setFormState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Произошла ошибка. Попробуйте позже.",
      );
      setTimeout(() => {
        setFormState("idle");
        setErrorMessage("");
      }, 5000);
    }
  };

  return (
    <div ref={sectionRef} className="reveal reveal-d1" style={{ opacity: 1 }}>
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Индикатор загрузки, если поля грузятся с клиента */}
        {isLoadingFields && (
          <p style={{ color: "rgba(128, 222, 234, 0.6)" }}>
            Загрузка полей формы...
          </p>
        )}

        {/* Сообщение, только если поля загрузились и их реально нет */}
        {!isLoadingFields && fields.length === 0 && (
          <p style={{ color: "rgba(128, 222, 234, 0.6)" }}>
            Поля формы не настроены в админке.
          </p>
        )}

        {fields.map((field) => {
          // Парсим options, если пришли строкой
          let parsedOptions: { label: string; value: string }[] = [];
          if (typeof field.options === "string") {
            try {
              parsedOptions = JSON.parse(field.options);
            } catch {
              parsedOptions = [];
            }
          } else if (Array.isArray(field.options)) {
            parsedOptions = field.options;
          }

          // placeholder как в старом ContactClient
          const basePlaceholder = field.placeholder?.trim() || field.label;
          const placeholder = field.required
            ? `${basePlaceholder} *`
            : basePlaceholder;

          // select требует label сверху — иначе непонятно, что выбирать
          if (field.type === "select") {
            return (
              <div key={field.name} className="space-y-1">
                <label className="text-sm" style={{ color: "#e0f7fa" }}>
                  {field.label}
                  {field.required && " *"}
                </label>
                <select
                  name={field.name}
                  required={field.required}
                  className="w-full rounded-xl px-5 py-4 text-base outline-none transition-all duration-150"
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                >
                  <option value="">—</option>
                  {parsedOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === "textarea") {
            return (
              <textarea
                key={field.name}
                name={field.name}
                required={field.required}
                placeholder={placeholder}
                rows={5}
                className="w-full rounded-xl px-5 py-4 text-base outline-none transition-all duration-150 resize-none"
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            );
          }

          return (
            <input
              key={field.name}
              type={field.type}
              name={field.name}
              required={field.required}
              placeholder={placeholder}
              className="w-full rounded-xl px-5 py-4 text-base outline-none transition-all duration-150"
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          );
        })}

        <div className="space-y-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivacyAgreed}
              onChange={(e) => {
                setIsPrivacyAgreed(e.target.checked);
                if (e.target.checked) setPrivacyError("");
              }}
              className="mt-1 w-5 h-5 shrink-0 rounded transition-all duration-150"
              style={{
                accentColor: "#2dd4bf",
                backgroundColor: "#0f2832",
                border: "2px solid rgba(45, 212, 191, 0.3)",
                cursor: "pointer",
              }}
              required
            />
            <span className="text-sm leading-relaxed" style={{ color: "#e0f7fa" }}>
              Я согласен(а) на обработку персональных данных в соответствии с{" "}
              <a
                href={privacyHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300 underline transition-colors"
                style={{ color: "#2dd4bf" }}
              >
                {privacyLabel}
              </a>
            </span>
          </label>

          {privacyError && (
            <p className="text-sm text-red-400 pl-8" style={{ color: "#f87171" }}>
              {privacyError}
            </p>
          )}
        </div>

        {formState === "error" && errorMessage && (
          <div
            className="flex items-start gap-3 rounded-xl p-4"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Ошибка отправки</p>
              <p className="text-red-300/80 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={formState === "loading" || formState === "success" || isLoadingFields}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {formState === "loading" && <Loader2 size={18} className="animate-spin" />}
          {formState === "success" && <Check size={18} />}
          {formState === "idle" && "Отправить"}
          {formState === "loading" && "Отправка..."}
          {formState === "success" && "Отправлено!"}
          {formState === "error" && "Попробовать снова!"}
        </button>

        {formState === "success" && (
          <p className="text-sm text-center" style={{ color: "rgba(52, 211, 153, 0.7)" }}>
            ✓ Заявка отправлена! Мы свяжемся с вами в ближайшее время
          </p>
        )}
      </form>
    </div>
  );
}