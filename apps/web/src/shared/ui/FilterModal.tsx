'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Category } from '@/entities/category';

const STORAGE_OPTIONS = ['256GB', '512GB', '1024GB', '2048GB'] as const;

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  categories: Category[];
  selectedCategorySlugs: string[];
  onCategoryToggle: (slug: string) => void;
  onReset: () => void;
  selectedStorage: string[];
  onStorageToggle: (value: string) => void;
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

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  categories,
  selectedCategorySlugs,
  onCategoryToggle,
  onReset,
  selectedStorage,
  onStorageToggle,
}: FilterModalProps) {
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const dragStartRef = useRef<{ el: HTMLDivElement; x: number; scrollLeft: number; pointerId: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handleCategoriesPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const el = categoriesScrollRef.current;
    if (!el) return;
    dragStartRef.current = {
      el,
      x: e.clientX,
      scrollLeft: el.scrollLeft,
      pointerId: e.pointerId,
    };
    isDraggingRef.current = false;
    // Не используем setPointerCapture — иначе клик не доходит до кнопок категорий

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

  const handleCategoriesClickCapture = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const el = categoriesScrollRef.current;
    if (!el || !isOpen) return;
    const check = () => setCanScrollRight(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, categories.length]);

  if (!isOpen) return null;

  const isAllSelected = selectedCategorySlugs.length === 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          // При клике на overlay отменяем изменения
          onClose();
        }}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl bg-white shadow-xl px-6 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content: label + horizontal scroll */}
          <p className="mb-3 text-sm font-medium text-neutral-600">Категории</p>
          <div className="relative -mx-1">
            <div
              ref={categoriesScrollRef}
              role="region"
              aria-label="Категории — можно листать перетаскиванием"
              className={`flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-2 cursor-grab active:cursor-grabbing ${canScrollRight ? 'pr-12' : ''}`}
              onPointerDown={handleCategoriesPointerDown}
              onClickCapture={handleCategoriesClickCapture}
            >
              <button
                type="button"
                onClick={onReset}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  isAllSelected
                    ? 'bg-neutral-900 text-white'
                    : 'border border-neutral-300 bg-transparent text-neutral-700 hover:border-neutral-400'
                }`}
              >
                Все категории
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryToggle(cat.slug)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    selectedCategorySlugs.includes(cat.slug)
                      ? 'bg-neutral-900 text-white'
                      : 'border border-neutral-300 bg-transparent text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {canScrollRight && (
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-2 flex w-12 items-center justify-end rounded-r-lg pl-4"
                style={{
                  background: 'linear-gradient(to left, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.6) 40%, transparent 100%)',
                }}
                aria-hidden
              >
                <ScrollHintIcon />
              </div>
            )}
          </div>

          {/* Объём памяти */}
          <p className="mb-2 mt-6 text-sm font-medium text-neutral-600">Объём памяти</p>
          <div className="flex flex-wrap gap-2">
            {STORAGE_OPTIONS.map((value) => {
              const isSelected = selectedStorage.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onStorageToggle(value)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    isSelected
                      ? 'bg-neutral-900 text-white'
                      : 'border border-neutral-300 bg-transparent text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onApply}
              className="w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
