'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product, ProductColorImage } from '@/entities/product';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';
import { cartStore } from '@/features/cart';

function ScrollHintIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-neutral-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

const SIM_TYPE_LABELS: Record<string, string> = {
  'sim-esim': 'SIM+eSIM',
  esim: 'eSIM',
  'dual-sim': 'Dual SIM',
};

function getSimTypeLabel(value: string | undefined): string {
  return (value && SIM_TYPE_LABELS[value]) || value || '';
}

function getImageUrl(img: ProductColorImage | undefined): string | null {
  if (!img) return null;
  if (img.imageUrl) return img.imageUrl;
  const media = img.image;
  if (typeof media === 'object' && media?.url) return media.url ?? null;
  return null;
}

interface ProductPageClientProps {
  product: Product;
  /** URL возврата в каталог с теми же фильтрами (только /catalog или /catalog?...) */
  returnTo?: string | null;
  /** Товары из той же категории (похожие) */
  similarProducts?: Product[];
}

function isValidReturnTo(value: string | undefined | null): value is string {
  return typeof value === 'string' && (value === '/catalog' || value.startsWith('/catalog?'));
}

function getProductImageUrl(p: Product): string | null {
  const colors = p.colors ?? [];
  const firstImg = colors[0]?.images?.[0];
  if (!firstImg) return null;
  if (firstImg.imageUrl) return firstImg.imageUrl;
  const media = firstImg.image;
  if (typeof media === 'object' && media?.url) return media.url ?? null;
  return null;
}

function getProductMinPrice(p: Product): number {
  const colors = p.colors ?? [];
  const prices = colors.flatMap((c) =>
    (c.manufacturerCountries ?? []).flatMap((storage) =>
      (storage.simTypes ?? []).map((s) => s.price)
    )
  );
  return prices.length > 0 ? Math.min(...prices) : 0;
}

export function ProductPageClient({ product, returnTo, similarProducts = [] }: ProductPageClientProps) {
  const catalogHref = isValidReturnTo(returnTo) ? returnTo : '/catalog';
  const colors = product.colors ?? [];
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedCountryIndex, setSelectedCountryIndex] = useState(0);
  const [selectedSimIndex, setSelectedSimIndex] = useState(0);
  const selectedColor = colors[selectedColorIndex];
  const storages = selectedColor?.manufacturerCountries ?? [];
  const selectedStorage = storages[selectedCountryIndex];
  const simTypes = selectedStorage?.simTypes ?? [];
  const selectedSim = simTypes[selectedSimIndex];
  const price = selectedSim?.price ?? 0;
  const images = selectedColor?.images ?? [];
  const mainImageUrl = getImageUrl(images[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const safeImageIndex = Math.min(
    activeImageIndex,
    Math.max(0, images.length - 1)
  );
  const currentImageUrl = getImageUrl(images[safeImageIndex]) ?? mainImageUrl;

  const similarScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollSimilarRight, setCanScrollSimilarRight] = useState(false);
  const similarDragStartRef = useRef<{ el: HTMLDivElement; x: number; scrollLeft: number; pointerId: number } | null>(null);
  const similarIsDraggingRef = useRef(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const el = similarScrollRef.current;
    if (!el || similarProducts.length === 0) return;
    const check = () => setCanScrollSimilarRight(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [similarProducts.length]);

  const handleSimilarPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const el = similarScrollRef.current;
    if (!el) return;
    similarDragStartRef.current = {
      el,
      x: e.clientX,
      scrollLeft: el.scrollLeft,
      pointerId: e.pointerId,
    };
    similarIsDraggingRef.current = false;
    // Не используем setPointerCapture — иначе клик не доходит до Link и переход не срабатывает

    const DRAG_THRESHOLD = 8;
    const onMove = (moveEvent: PointerEvent) => {
      const start = similarDragStartRef.current;
      if (!start || moveEvent.pointerId !== start.pointerId) return;
      const dx = start.x - moveEvent.clientX;
      if (!similarIsDraggingRef.current && Math.abs(dx) > DRAG_THRESHOLD) {
        similarIsDraggingRef.current = true;
        document.body.classList.add('cursor-grabbing', 'select-none');
      }
      if (similarIsDraggingRef.current) {
        start.el.scrollLeft = start.scrollLeft + dx;
      }
    };
    const onUp = (upEvent: PointerEvent) => {
      const start = similarDragStartRef.current;
      if (start && upEvent.pointerId === start.pointerId) {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      }
      document.body.classList.remove('cursor-grabbing', 'select-none');
      similarDragStartRef.current = null;
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, []);

  const handleSimilarClickCapture = useCallback((e: React.MouseEvent) => {
    if (similarIsDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      similarIsDraggingRef.current = false;
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product.id]);

  const category =
    product.category && typeof product.category === 'object'
      ? product.category
      : null;
  const categoryName = category?.name ?? '';
  const categorySlug = category?.slug ?? '';

  return (
    <main>
      {/* Зебра: хлебные крошки на сером, как в каталоге. */}
      <div className="w-full bg-neutral-100 py-4">
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            categoryName={categoryName}
            categorySlug={categorySlug}
            productTitle={product.title}
            catalogHref={catalogHref}
          />
        </div>
      </div>

      {/* Контент товара на белом. Отступ сверху и снизу одинаковый (py-6). */}
      <section className="w-full bg-white py-6">
        <div className="mx-auto max-w-6xl px-4">
          <Link
            href={catalogHref}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-200/80 hover:text-neutral-900"
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
            Каталог
          </Link>

          <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-100">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-400">
                  Нет фото
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-2 flex justify-center overflow-x-auto pb-1">
                <div className="flex gap-2">
                {images.map((img, i) => {
                  const url = getImageUrl(img);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        i === safeImageIndex
                          ? 'border-neutral-900'
                          : 'border-transparent hover:border-neutral-300'
                      }`}
                    >
                      {url ? (
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-neutral-200" />
                      )}
                    </button>
                  );
                })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-semibold text-neutral-900">
              {product.title}
            </h1>
            {simTypes.length > 0 && price > 0 && (
              <p className="mt-2 text-2xl font-semibold text-neutral-900">
                {price.toLocaleString('ru-RU')} ₽
              </p>
            )}

            {colors.length > 1 && (
              <div className="mt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Цвет
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c, i) => {
                    const isSelected = selectedColorIndex === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedColorIndex(i);
                          setSelectedCountryIndex(0);
                          setSelectedSimIndex(0);
                          setActiveImageIndex(0);
                        }}
                        className={`rounded-full px-5 py-2.5 text-sm transition ${
                          isSelected
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {c.color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {storages.length > 0 && (
              <div className="mt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Объём памяти
                </p>
                <div className="flex flex-wrap gap-2">
                  {storages.map((mc, i) => {
                    const isSelected = selectedCountryIndex === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedCountryIndex(i);
                          setSelectedSimIndex(0);
                        }}
                        className={`rounded-full px-5 py-2.5 text-sm transition ${
                          isSelected
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {mc.country}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {simTypes.length > 0 && (
              <div className="mt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Тип SIM
                </p>
                <div className="flex flex-wrap gap-2">
                  {simTypes.map((st, i) => {
                    const isSelected = selectedSimIndex === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedSimIndex(i)}
                        className={`rounded-full px-5 py-2.5 text-sm transition ${
                          isSelected
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {getSimTypeLabel(st.simType)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4">
              {colors.length > 0 && (
                <button
                  type="button"
                  disabled={!selectedColor || !selectedStorage || !selectedSim}
                  onClick={() => {
                    if (!selectedColor || !selectedStorage || !selectedSim || price <= 0) return;
                    cartStore.add({
                      productId: String(product.id),
                      title: product.title,
                      color: selectedColor.color,
                      storage: selectedStorage.country,
                      simType: selectedSim.simType,
                      price,
                    });
                    setJustAdded(true);
                    setTimeout(() => setJustAdded(false), 900);
                  }}
                  className={`inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 ${
                    justAdded
                      ? 'bg-emerald-600 hover:bg-emerald-600 active:bg-emerald-700 scale-95'
                      : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950'
                  }`}
                >
                  {justAdded ? 'Добавлено' : 'Добавить в корзину'}
                </button>
              )}

              {product.description && (
                <p className="text-sm leading-relaxed text-neutral-600">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </div>
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="w-full border-t border-neutral-200 bg-neutral-50 py-6">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-3 text-xl font-bold tracking-tight text-neutral-900">
              Похожие товары
            </h2>
            <div className="relative -mx-4 md:mx-0">
              <div
                ref={similarScrollRef}
                role="region"
                aria-label="Похожие товары — можно листать перетаскиванием"
                className={`flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing ${canScrollSimilarRight ? 'pr-14' : ''}`}
                onPointerDown={handleSimilarPointerDown}
                onClickCapture={handleSimilarClickCapture}
              >
              {similarProducts.map((similar) => {
                const imgUrl = getProductImageUrl(similar);
                const minPrice = getProductMinPrice(similar);
                const similarHref =
                  catalogHref === '/catalog'
                    ? `/catalog/product/${similar.id}`
                    : `/catalog/product/${similar.id}?returnTo=${encodeURIComponent(catalogHref)}`;
                return (
                  <Link
                    key={similar.id}
                    href={similarHref}
                    className="group flex min-w-[140px] max-w-[140px] flex-shrink-0 flex-col text-center"
                  >
                    <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={similar.title}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                          Нет фото
                        </div>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-neutral-900 group-hover:underline">
                      {similar.title}
                    </p>
                    {minPrice > 0 && (
                      <p className="mt-1 text-sm font-semibold text-neutral-900">
                        {minPrice.toLocaleString('ru-RU')} ₽
                      </p>
                    )}
                  </Link>
                );
              })}
              </div>
              {canScrollSimilarRight && (
                <div
                  className="pointer-events-none absolute right-0 top-0 bottom-2 flex w-12 items-center justify-end pl-4"
                  style={{
                    background: 'linear-gradient(to left, rgb(249 250 251) 0%, rgb(249 250 251 / 0.6) 50%, transparent 100%)',
                  }}
                  aria-hidden
                >
                  <ScrollHintIcon />
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
