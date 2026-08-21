'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function ContactClient() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Лёгкая анимация появления
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const isSlowDevice = 
      (navigator.hardwareConcurrency || 8) <= 4 ||
      window.innerWidth < 480;

    if (isSlowDevice) {
      section.style.opacity = '1';
      section.style.transform = 'none';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('loading');
    setErrorMessage('');

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
    };

    // Валидация
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
      );

      setTimeout(() => {
        setFormState('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <div 
      ref={sectionRef}
      className="reveal reveal-d1"
      style={{ opacity: 1 }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          disabled={formState === 'loading' || formState === "success"}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {formState === 'loading' && <Loader2 size={18} className="animate-spin" />}
          {formState === 'success' && <Check size={18} />}
          {formState === 'idle' && 'Отправить'}
          {formState === 'loading' && 'Отправка...'}
          {formState === 'success' && 'Отправлено!'}
          {formState === 'error' && 'Попробовать снова!'}
        </button>

        {formState === 'success' && (
          <p 
            className="text-sm text-center"
            style={{ color: 'rgba(52, 211, 153, 0.7)' }}
          >
            ✓ Заявка отправлена! Мы свяжемся с вами в ближайшее время
          </p>
        )}
      </form>
    </div>
  );
}