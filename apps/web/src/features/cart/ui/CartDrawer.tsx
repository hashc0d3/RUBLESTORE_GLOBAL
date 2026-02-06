'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { cartStore } from '@/features/cart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer = observer(function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      setIsScrolled(content.scrollTop > 0);
    };

    content.addEventListener('scroll', handleScroll, { passive: true });
    return () => content.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Полупрозрачный фон */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-out"
        aria-label="Закрыть корзину"
      />

      {/* Панель корзины */}
      <aside className="relative flex h-full w-80 max-w-full flex-col bg-white shadow-2xl ring-1 ring-black/5 transform transition-transform duration-300 ease-out translate-x-0">
        <header
          className={`flex items-center justify-between px-4 py-3 transition-all duration-300 ${
            isScrolled
              ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-neutral-200/80'
              : 'border-b border-neutral-200'
          }`}
          style={
            isScrolled
              ? {
                  backdropFilter: 'saturate(180%) blur(20px)',
                  WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                }
              : undefined
          }
        >
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
            Корзина
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Закрыть корзину"
          >
            <span className="sr-only">Закрыть корзину</span>
            <span className="relative block h-4 w-4">
              <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 rounded-full bg-current" />
              <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-current" />
            </span>
          </button>
        </header>

        <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-3">
          {cartStore.totalItems === 0 ? (
            <p className="text-sm text-neutral-500">Корзина пуста.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {cartStore.items.map((item) => (
                <li
                  key={item.id}
                  className="space-y-1 rounded-2xl border border-neutral-200 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-neutral-900">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        {[item.color, item.storage, item.simType].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => cartStore.remove(item.id)}
                      className="ml-1 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                      aria-label="Удалить из корзины"
                    >
                      <span className="sr-only">Удалить</span>
                      <span className="relative block h-3 w-3">
                        <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 rotate-45 rounded-full bg-current" />
                        <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-current" />
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => cartStore.setQuantity(item.id, item.quantity - 1)}
                        className="px-1 text-xs text-neutral-700 hover:text-neutral-900"
                        aria-label="Уменьшить количество"
                      >
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center text-xs text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => cartStore.setQuantity(item.id, item.quantity + 1)}
                        className="px-1 text-xs text-neutral-700 hover:text-neutral-900"
                        aria-label="Увеличить количество"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-neutral-900">
                      {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-neutral-200 px-4 py-3 space-y-3">
          <div className="text-xs text-neutral-700">
            <div className="flex items-center justify-between">
              <span>Всего товаров</span>
              <span className="font-semibold">{cartStore.totalItems}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>Сумма</span>
              <span className="font-semibold">
                {cartStore.totalPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>

          {cartStore.totalItems > 0 && (
            <a
              href="/checkout"
              className="block w-full rounded-full bg-neutral-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Перейти к оформлению
            </a>
          )}
        </footer>
      </aside>
    </div>
  );
});

