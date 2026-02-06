'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartStore } from '@/features/cart';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';

export default observer(function CheckoutPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  useEffect(() => {
    cartStore.hydrate();
  }, []);

  const handleBack = () => {
    router.back();
  };

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

    // TODO: обработка отправки заказа
    console.log('Заказ оформлен');
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <Breadcrumbs
          items={[
            { label: 'Главная страница', href: '/' },
            { label: 'Каталог', href: '/catalog' },
            { label: 'Оформление заказа' },
          ]}
        />

        <div className="mb-8 mt-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Оформление заказа</h1>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200/80 hover:text-neutral-900"
            aria-label="Вернуться назад"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            Назад
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Левая колонка: Оплата */}
          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">Способ оплаты</h2>
              
              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-neutral-200 p-4 transition-colors hover:border-neutral-300">
                  <input
                    type="radio"
                    name="payment"
                    value="split"
                    defaultChecked
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-neutral-900">Сплит оплата</div>
                    <div className="mt-1 text-sm text-neutral-500">
                      Разделите платеж на несколько частей
                    </div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-neutral-200 p-4 transition-colors hover:border-neutral-300">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-neutral-900">Банковская карта</div>
                    <div className="mt-1 text-sm text-neutral-500">
                      Оплата картой онлайн
                    </div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-neutral-200 p-4 transition-colors hover:border-neutral-300">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-neutral-900">Наличными при получении</div>
                    <div className="mt-1 text-sm text-neutral-500">
                      Оплатите курьеру при доставке
                    </div>
                  </div>
                </label>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">Контактные данные</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Имя <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm transition-colors focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    placeholder="Введите ваше имя"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm transition-colors focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    placeholder="+7 (___) ___-__-__"
                    maxLength={18}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Адрес доставки <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm transition-colors focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    placeholder="Введите адрес доставки"
                  />
                </div>

                {cartStore.totalItems > 0 && (
                  <button
                    type="submit"
                    className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                  >
                    Оформить заказ
                  </button>
                )}
              </form>
            </section>
          </div>

          {/* Правая колонка: Товары из корзины */}
          <div>
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">Ваш заказ</h2>

              {cartStore.totalItems === 0 ? (
                <p className="text-sm text-neutral-500">Корзина пуста</p>
              ) : (
                <>
                  <ul className="space-y-4">
                    {cartStore.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-4 rounded-xl border border-neutral-200 p-4"
                      >
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                          <p className="text-xs text-neutral-500">
                            {[item.color, item.storage, item.simType].filter(Boolean).join(' · ')}
                          </p>
                          <p className="text-xs text-neutral-700">
                            Количество: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 space-y-2 border-t border-neutral-200 pt-4">
                    <div className="flex items-center justify-between text-sm text-neutral-700">
                      <span>Всего товаров</span>
                      <span className="font-semibold">{cartStore.totalItems}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold text-neutral-900">
                      <span>Итого</span>
                      <span>{cartStore.totalPrice.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
});
