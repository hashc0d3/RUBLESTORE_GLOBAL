'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollRight(el.scrollWidth > el.clientWidth);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [products.length]);

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
        className="flex gap-6 overflow-x-auto pb-2 scroll-smooth scrollbar-hide pl-4 md:pl-[max(1rem,calc((100vw-72rem)/2+1rem))]"
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
              {product.storage && (
                <p className="mt-0.5 text-sm text-neutral-500">{product.storage}</p>
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
