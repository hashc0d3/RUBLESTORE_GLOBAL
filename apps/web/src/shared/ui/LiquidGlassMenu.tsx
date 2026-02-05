'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Category } from '@/entities/category';

type LiquidGlassMenuVariant = 'full' | 'pill';

interface LiquidGlassMenuProps {
  categories: Category[];
  variant?: LiquidGlassMenuVariant;
}

function ScrollHintIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-neutral-500"
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

export function LiquidGlassMenu({ categories, variant = 'pill' }: LiquidGlassMenuProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isFull = variant === 'full';

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
  }, [categories.length]);

  return (
    <nav
      className={`h-full transition-all duration-300 ease-out ${isFull ? 'mt-0 w-full' : 'mt-4 flex justify-center'}`}
      aria-label="Главное меню"
    >
      <div
        className={`relative h-full w-full max-w-full overflow-hidden transition-[border-radius,box-shadow] duration-300 ease-out ${
          isFull
            ? ''
            : 'rounded-full shadow-sm ring-1 ring-neutral-200/80'
        }`}
      >
        <div
          className={`relative flex h-full flex-nowrap items-center gap-0.5 overflow-x-auto scrollbar-hide scroll-smooth transition-[border-radius,padding] duration-300 ease-out py-2 pl-3 pr-3 md:gap-1 md:pl-4 md:pr-4 md:py-2.5 ${
            isFull && !canScrollRight ? 'justify-center' : 'justify-start'
          } ${isFull ? 'rounded-none py-1.5' : 'rounded-full'}`}
          ref={scrollRef}
          style={
            isFull
              ? undefined
              : {
                  background: 'rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'saturate(180%) blur(20px)',
                  WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                }
          }
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${encodeURIComponent(cat.slug)}`}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-neutral-800 transition-colors hover:bg-neutral-200/50 hover:text-neutral-900 md:px-4 md:py-2 md:text-sm"
            >
              {cat.name}
            </Link>
          ))}
        </div>
        {canScrollRight && (
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 flex w-12 items-center justify-end pl-4 transition-[border-radius] duration-300 ease-out ${
              isFull ? 'rounded-r-none' : 'rounded-r-full'
            }`}
            style={{
              background: isFull
                ? 'linear-gradient(to left, rgb(250 250 250) 0%, rgb(250 250 250 / 0.5) 50%, transparent 100%)'
                : 'linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 40%, transparent 100%)',
            }}
            aria-hidden
          >
            <ScrollHintIcon />
          </div>
        )}
      </div>
    </nav>
  );
}
