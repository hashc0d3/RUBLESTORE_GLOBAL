'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '@/entities/product';

interface ProductGridProps {
  products: Product[];
  /** Строка query каталога (category=...&storage=...) для ссылки «назад в каталог» с теми же фильтрами */
  catalogReturnQuery?: string;
}

function getImageUrl(product: Product): string | null {
  const colors = product.colors ?? [];
  const firstImg = colors[0]?.images?.[0];
  if (!firstImg) return null;
  if (firstImg.imageUrl) return firstImg.imageUrl;
  const media = firstImg.image;
  if (typeof media === 'object' && media?.url) return media.url;
  return null;
}

/** Список объёмов памяти по цветам (из блока «Объём памяти» внутри цвета) */
function getProductStorages(product: Product): string[] {
  const colors = product.colors ?? [];
  const set = new Set<string>();
  colors.forEach((c) => {
    (c.manufacturerCountries ?? []).forEach((m) => {
      if (m.country) set.add(m.country);
    });
  });
  return Array.from(set);
}

function ScrollHintIcon() {
  return (
    <svg
      className="h-6 w-6 shrink-0 text-neutral-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

export function ProductGrid({ products, catalogReturnQuery }: ProductGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const dragStartRef = useRef<{ el: HTMLDivElement; x: number; scrollLeft: number; pointerId: number } | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setCanScrollRight(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [products.length]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const el = scrollRef.current;
    if (!el) return;
    dragStartRef.current = {
      el,
      x: e.clientX,
      scrollLeft: el.scrollLeft,
      pointerId: e.pointerId,
    };
    isDraggingRef.current = false;
    // Не используем setPointerCapture — иначе клик не доходит до Link и переход не срабатывает

    const DRAG_THRESHOLD = 8;
    const onMove = (moveEvent: PointerEvent) => {
      const start = dragStartRef.current;
      if (!start || moveEvent.pointerId !== start.pointerId) return;
      const dx = start.x - moveEvent.clientX;
      if (!isDraggingRef.current && Math.abs(dx) > DRAG_THRESHOLD) {
        isDraggingRef.current = true;
        document.body.classList.add('cursor-grabbing', 'select-none');
      }
      if (isDraggingRef.current) {
        start.el.scrollLeft = start.scrollLeft + dx;
      }
    };
    const onUp = (upEvent: PointerEvent) => {
      const start = dragStartRef.current;
      if (start && upEvent.pointerId === start.pointerId) {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      }
      document.body.classList.remove('cursor-grabbing', 'select-none');
      dragStartRef.current = null;
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, []);

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = false;
    }
  }, []);

  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-neutral-600">
        В этой категории пока нет товаров
      </p>
    );
  }

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        role="region"
        aria-label="Товары категории — можно листать перетаскиванием"
        className={`flex gap-6 overflow-x-auto pb-2 scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing pl-4 md:pl-[max(1rem,calc((100vw-72rem)/2+1rem))] ${canScrollRight ? 'pr-14' : ''}`}
        onPointerDown={handlePointerDown}
        onClickCapture={handleClickCapture}
      >
      {products.map((product) => {
        const imgUrl = getImageUrl(product);

        const colors = product.colors ?? [];
        const allPrices = colors.flatMap((c) =>
          (c.manufacturerCountries ?? []).flatMap((m) =>
            (m.simTypes ?? []).map((s) => s.price)
          )
        );
        const minPrice =
          allPrices.length > 0 ? Math.min(...allPrices) : 0;

        return (
          <Link
            key={product.id}
            href={
              catalogReturnQuery
                ? `/catalog/product/${product.id}?returnTo=${encodeURIComponent('/catalog?' + catalogReturnQuery)}`
                : `/catalog/product/${product.id}`
            }
            className="group relative z-0 flex min-w-[280px] max-w-[280px] flex-shrink-0 flex-col p-5 transition-[z-index] hover:z-10 md:p-6"
          >
            <div className="aspect-square overflow-visible rounded-lg">
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={product.title}
                  className="h-full w-full rounded-lg object-cover transition duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-50 text-neutral-400">
                  Нет фото
                </div>
              )}
            </div>
            <div className="mt-3 text-center">
              <h2 className="font-medium text-neutral-900 group-hover:underline">
                {product.title}
              </h2>
              {getProductStorages(product).length > 0 && (
                <p className="mt-0.5 text-sm text-neutral-500">
                  {getProductStorages(product).join(', ')}
                </p>
              )}
              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {minPrice.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </Link>
        );
      })}
      </div>
      {canScrollRight && (
        <div
          className="pointer-events-none absolute right-0 top-0 flex h-full items-center bg-gradient-to-l from-white via-white/80 to-transparent pl-8 pr-2"
          aria-hidden
        >
          <ScrollHintIcon />
        </div>
      )}
    </div>
  );
}
