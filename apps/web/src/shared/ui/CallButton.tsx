'use client';

import Image from 'next/image';
import { useState } from 'react';

export function CallButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phone, setPhone] = useState('');

  const formatPhone = (value: string) => {
    // Удаляем все, кроме цифр
    const digits = value.replace(/\D/g, '');

    // Форматируем под маску +7 (999) 999-99-99
    if (digits.length === 0) return '';
    if (digits.length <= 1) return '+7';
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем, что номер полностью введен (11 цифр)
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 11) {
      alert('Пожалуйста, введите полный номер телефона');
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsSubmitted(false);
      setPhone('');
    }, 1500);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          className="group flex items-center gap-3 rounded-full shadow-lg transition-all duration-300 ease-out"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.9) 50%, rgba(255,241,235,0.88) 100%)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            boxShadow:
              '0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.12), 0 8px 24px -4px rgba(0,0,0,0.08)',
            width: isExpanded ? 'auto' : '56px',
            height: '56px',
            padding: isExpanded ? '12px 20px 12px 12px' : '12px',
          }}
          aria-label="Заказать звонок"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <Image
              src="/phone-call.png"
              alt=""
              width={20}
              height={20}
              className="object-contain"
            />
          </div>

          <span
            className="overflow-hidden whitespace-nowrap text-sm font-semibold text-neutral-900 transition-all duration-300"
            style={{
              maxWidth: isExpanded ? '200px' : '0px',
              opacity: isExpanded ? 1 : 0,
            }}
          >
            Заказать звонок
          </span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay */}
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            aria-label="Закрыть"
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Заказать звонок</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Закрыть"
              >
                <span className="relative block h-5 w-5">
                  <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 rounded-full bg-current" />
                  <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-current" />
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Имя <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitted}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm transition-colors focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  placeholder="Введите ваше имя"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Номер телефона <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={isSubmitted}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm transition-colors focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  placeholder="+7 (___) ___-__-__"
                  maxLength={18}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Почта
                </label>
                <input
                  type="email"
                  disabled={isSubmitted}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm transition-colors focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  placeholder="example@mail.ru"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Описание
                </label>
                <textarea
                  rows={3}
                  disabled={isSubmitted}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm transition-colors focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  placeholder="Дополнительная информация"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className={`w-full rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out ${
                  isSubmitted
                    ? 'bg-emerald-600 hover:bg-emerald-600 active:bg-emerald-700 scale-95'
                    : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950'
                }`}
              >
                {isSubmitted ? 'Заявка отправлена' : 'Отправить'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
