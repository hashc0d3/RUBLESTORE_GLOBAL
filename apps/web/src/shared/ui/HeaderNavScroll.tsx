'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { Category } from '@/entities/category';
import { LiquidGlassMenu } from '@/shared/ui/LiquidGlassMenu';
import { CartDrawer } from '@/features/cart/ui/CartDrawer';
import { cartStore } from '@/features/cart';

const SCROLL_THRESHOLD = 16;
const MOBILE_MAX_WIDTH = 500;
const SITE_NAME = 'RubleStore';

interface HeaderNavScrollProps {
  categories: Category[];
}

function Logo({ withPill }: { withPill: boolean }) {
  const pillClasses = withPill
    ? 'mt-4 h-11 py-2 pl-3 pr-3 md:py-2.5 md:pl-4 md:pr-4'
    : 'py-1.5 pl-3 pr-3 md:pl-4 md:pr-4';

  return (
    <Link
      href="/"
      className={`group flex shrink-0 items-center gap-1 rounded-full ${pillClasses}`}
      aria-label={`${SITE_NAME} — на главную`}
      style={
        withPill
          ? {
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.9) 50%, rgba(255,241,235,0.88) 100%)',
              backdropFilter: 'saturate(180%) blur(20px)',
              WebkitBackdropFilter: 'saturate(180%) blur(20px)',
              boxShadow:
                '0 0 0 1px rgba(0,0,0,0.04), 0 2px 6px -2px rgba(0,0,0,0.08)',
            }
          : undefined
      }
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center md:h-6 md:w-6">
        <Image
          src="/logo-icon.svg"
          alt=""
          width={24}
          height={24}
          className="object-contain"
          aria-hidden
        />
      </span>
      <span className="text-[13px] font-semibold tracking-tight text-neutral-900 transition-colors group-hover:text-neutral-700 md:text-sm">
        {SITE_NAME}
      </span>
      {!withPill && (
        <span className="hidden text-[13px] font-semibold tracking-tight text-neutral-900 md:inline md:text-sm">
          {' | Омск'}
        </span>
      )}
    </Link>
  );
}

export const HeaderNavScroll = observer(function HeaderNavScroll({
  categories,
}: HeaderNavScrollProps) {
  const [atTop, setAtTop] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);

  useEffect(() => {
    cartStore.hydrate();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setAtTop(window.scrollY <= SCROLL_THRESHOLD);
    };
    const handleResize = () => {
      setIsCompact(window.innerWidth < MOBILE_MAX_WIDTH);
    };

    handleScroll();
    handleResize();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Лёгкая анимация числа товаров при добавлении
  useEffect(() => {
    if (cartStore.totalItems <= 0) return;
    setCartBump(true);
    const t = setTimeout(() => setCartBump(false), 250);
    return () => clearTimeout(t);
  }, [cartStore.totalItems]);

  // Мобильная версия: отдельная кнопка-иконка и выпадающий список категорий
  if (isCompact) {
    const logoHasPill = !atTop;

    return (
      <>
        <div
          className={`relative mx-auto flex h-full w-full max-w-6xl items-center justify-between ${
            mobileOpen ? 'gap-4' : 'gap-2'
          } transition-[padding,max-width] duration-300 ease-out px-4`}
        >
          <Logo withPill={logoHasPill} />

          {/* Правый блок: корзина + меню в одном liquid glass контейнере */}
          <div
            className={`flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-neutral-800 shadow-sm ring-1 ring-neutral-200/70 backdrop-blur-md ${
              logoHasPill ? 'mt-4' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="inline-flex items-center justify-center bg-transparent px-1 py-0 hover:text-neutral-900"
              aria-label="Открыть корзину"
            >
              <span className="sr-only">Открыть корзину</span>
              <div className="flex items-center gap-1">
                <Image
                  src="/bag.png"
                  alt=""
                  width={18}
                  height={18}
                  className="h-4 w-4 object-contain"
                />
                <span
                  className={`text-[11px] text-neutral-500 transform transition-transform duration-200 ${
                    cartBump ? 'scale-110' : 'scale-100'
                  }`}
                >
                  {cartStore.totalItems}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-7 w-7 items-center justify-center bg-transparent p-0 text-neutral-800 hover:text-neutral-900"
              aria-label="Открыть меню категорий"
            >
              <span className="sr-only">Открыть меню категорий</span>
              {mobileOpen ? (
                <span className="relative flex h-3 w-4 items-center justify-center">
                  <span className="absolute h-[2px] w-4 rotate-45 rounded-full bg-neutral-800" />
                  <span className="absolute h-[2px] w-4 -rotate-45 rounded-full bg-neutral-800" />
                </span>
              ) : (
                <span className="flex flex-col items-center justify-center gap-0.5">
                  <span className="h-[2px] w-4 rounded-full bg-neutral-800" />
                  <span className="h-[2px] w-4 rounded-full bg-neutral-800" />
                </span>
              )}
            </button>
          </div>

        {mobileOpen && (
          <div
            className={`absolute left-3 right-3 top-full z-40 ${
              logoHasPill ? 'mt-4' : 'mt-2'
            } rounded-3xl bg-white/80 shadow-[0_18px_40px_rgba(15,23,42,0.22)] ring-1 ring-neutral-200/80 backdrop-blur-xl`}
          >
            <nav
              className="flex flex-col divide-y divide-neutral-200/80"
              aria-label="Категории"
            >
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalog?category=${encodeURIComponent(cat.slug)}`}
                  className="px-4 py-3 text-[15px] font-medium text-neutral-900 transition-colors hover:bg-neutral-100 active:bg-neutral-200/80"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
        </div>
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </>
    );
  }

  // Десктопная версия: логотип + горизонтальное меню, корзина отдельно справа
  const cartHasPill = !atTop;

  return (
    <>
      <div
        className="mx-auto flex h-full min-h-0 w-full max-w-6xl items-center justify-center gap-2 px-4 transition-[padding,max-width] duration-300 ease-out"
      >
        <Logo withPill={!atTop} />
        <div className="min-w-0 flex-1">
          <LiquidGlassMenu categories={categories} variant={atTop ? 'full' : 'pill'} />
        </div>

        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className={`inline-flex items-center justify-center text-neutral-800 hover:text-neutral-900 transition-all duration-300 ${
            cartHasPill
              ? 'mt-4 h-11 px-3 py-2.5 rounded-full shadow-sm'
              : 'p-1.5 bg-transparent'
          }`}
          style={
            cartHasPill
              ? {
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.9) 50%, rgba(255,241,235,0.88) 100%)',
                  backdropFilter: 'saturate(180%) blur(20px)',
                  WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                  boxShadow:
                    '0 0 0 1px rgba(0,0,0,0.04), 0 2px 6px -2px rgba(0,0,0,0.08)',
                }
              : undefined
          }
          aria-label="Открыть корзину"
        >
          <span className="sr-only">Открыть корзину</span>
          <div className="flex items-center gap-1">
            <Image
              src="/bag.png"
              alt=""
              width={18}
              height={18}
              className="h-4 w-4 object-contain"
            />
            <span
              className={`text-[11px] text-neutral-500 transform transition-transform duration-200 ${
                cartBump ? 'scale-110' : 'scale-100'
              }`}
            >
              {cartStore.totalItems}
            </span>
          </div>
        </button>
      </div>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
});
