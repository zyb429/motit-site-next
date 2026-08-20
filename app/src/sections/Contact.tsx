import { useState, useRef } from 'react';
import { useReveal } from '../hooks/useReveal';
import { Phone, Mail, MapPin, Check, Loader2, Clock, AlertCircle } from 'lucide-react';

type formState = 'idle' | 'loading' | 'success' | 'error'

export default function Contact() {
  const [formState, setFormState] = useState<formState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useReveal(sectionRef);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('loading');
    setErrorMessage('');

    // парсим данные из формы
    const formData = new FormData(e.currentTarget);

    const name = (formData.get('name') as string) || '';
    const email = (formData.get('email') as string) || '';
    const phone = (formData.get('phone') as string) || '';
    const message = (formData.get('message') as string) || '';
    

    const data = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    }

    console.log('Отправляемые данные:', data); // отладка

    // валидация формы на клиенте
    if (!data.name || data.name.length < 2) {
      setFormState('error');
      setErrorMessage('Имя должно содержать минимум 2 символа');
      setTimeout(() => setFormState('idle'), 3000);
      return;
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setFormState('error');
      setErrorMessage('Введите корректный email');
      setTimeout(() => setFormState('idle'), 3000);
      return;
    }

    if (!data.message || data.message.length < 5) {
      setFormState('error');
      setErrorMessage('Сообщение слишком короткое');
      setTimeout(() => setFormState('idle'), 3000);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({data}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка отправки');
      }

      setFormState('success');
      formRef.current?.reset();

      setTimeout(() => {
        setFormState('idle');
      }, 4000);

    } catch (error) {
      console.error('Ошибка отправки:', error);
      setFormState('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Произошла ошибка. Попробуйте позже.'
      )

      setTimeout(() => {
        setFormState('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="section-padding" style={{ backgroundColor: '#0a1920' }}>
      <div className="content-container">
        <div className="reveal mb-12 md:mb-16">
          <span className="section-label block mb-3">КОНТАКТЫ</span>
          <h2 className="section-title mb-4">Свяжитесь с нами</h2>
          <p className="section-subtitle max-w-[600px]">Готовы обсудить ваши задачи и предложить оптимальное решение</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="reveal reveal-d1 flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Ваше имя"
              required
              className="w-full rounded-xl px-5 py-4 text-base outline-none transition-all duration-150"
              style={{
                backgroundColor: '#0f2832',
                border: '1.5px solid rgba(45, 212, 191, 0.2)',
                color: '#e0f7fa',
                fontSize: '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2dd4bf'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full rounded-xl px-5 py-4 text-base outline-none transition-all duration-150"
              style={{
                backgroundColor: '#0f2832',
                border: '1.5px solid rgba(45, 212, 191, 0.2)',
                color: '#e0f7fa',
                fontSize: '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2dd4bf'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Телефон"
              className="w-full rounded-xl px-5 py-4 text-base outline-none transition-all duration-150"
              style={{
                backgroundColor: '#0f2832',
                border: '1.5px solid rgba(45, 212, 191, 0.2)',
                color: '#e0f7fa',
                fontSize: '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2dd4bf'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <textarea
              name="message"
              placeholder="Сообщение"
              rows={5}
              required
              className="w-full rounded-xl px-5 py-4 text-base outline-none transition-all duration-150 resize-none"
              style={{
                backgroundColor: '#0f2832',
                border: '1.5px solid rgba(45, 212, 191, 0.2)',
                color: '#e0f7fa',
                fontSize: '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2dd4bf'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45, 212, 191, 0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
            />

              {/* Сообщение об ошибке */}
            {formState === 'error' && errorMessage && (
              <div 
                className="flex items-start gap-3 rounded-xl p-4"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Ошибка отправки</p>
                  <p className="text-red-300/80 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={formState === 'loading' || formState === "success" }
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {formState === 'loading' && <Loader2 size={18} className="animate-spin" />}
              {formState === 'success' && <Check size={18} />}
              {formState === 'idle' && 'Отправить'}
              {formState === 'loading' && 'Отправка...'}
              {formState === 'success' && 'Отправлено!'}
              {formState === 'error' && 'Попробовать снова!'}
            </button>
            {/* Подсказка при успехе */}
            {formState === 'success' && (
              <p 
                className="text-sm text-center"
                style={{ color: 'rgba(52, 211, 153, 0.7)' }}
              >
                ✓ Заявка отправлена! Мы свяжемся с вами в ближайшее время
              </p>
            )}
          </form>

          {/* Contact Info */}
          <div className="reveal reveal-d2 flex flex-col gap-4">
            {[
              {
                icon: Phone,
                label: 'Телефон',
                value: '+375 (29) 118-50-82',
                href: 'tel:+375291185082',
              },
              {
                icon: Mail,
                label: 'Email',
                value: 'info@motit.by',
                href: 'mailto:info@motit.by',
              },
              {
                icon: MapPin,
                label: 'Адрес',
                value: 'г. Минск, ул. Сухаревская, д. 16, п. 71',
              },
              {
                icon: Clock,
                label: 'Режим работы',
                value: 'Пн–Пт: 9:00 – 18:00',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              const content = (
                <div
                  className="flex items-start gap-4 rounded-xl p-5 transition-all duration-150"
                  style={{
                    backgroundColor: '#0f2832',
                    border: '1.5px solid rgba(45, 212, 191, 0.15)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(45, 212, 191, 0.12)' }}
                  >
                    <Icon size={20} style={{ color: '#2dd4bf' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1" style={{ color: '#e0f7fa' }}>
                      {item.label}
                    </h4>
                    <span className="text-base" style={{ color: 'rgba(128, 222, 234, 0.85)' }}>
                      {item.value}
                    </span>
                  </div>
                </div>
              );
              return item.href ? (
                <a
                  key={i}
                  href={item.href}
                  className="block transition-all duration-150 hover:-translate-y-1"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {content}
                </a>
              ) : (
                <div key={i}>{content}</div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
