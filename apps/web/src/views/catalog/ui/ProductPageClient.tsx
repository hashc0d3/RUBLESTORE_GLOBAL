'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Product, ProductColorImage } from '@/entities/product';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';

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
}

function isValidReturnTo(value: string | undefined | null): value is string {
  return typeof value === 'string' && (value === '/catalog' || value.startsWith('/catalog?'));
}

export function ProductPageClient({ product, returnTo }: ProductPageClientProps) {
  const catalogHref = isValidReturnTo(returnTo) ? returnTo : '/catalog';
  const colors = product.colors ?? [];
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedCountryIndex, setSelectedCountryIndex] = useState(0);
  const [selectedSimIndex, setSelectedSimIndex] = useState(0);
  const selectedColor = colors[selectedColorIndex];
  const countries = selectedColor?.manufacturerCountries ?? [];
  const selectedCountry = countries[selectedCountryIndex];
  const simTypes = selectedCountry?.simTypes ?? [];
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
            className="inline-block text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Каталог
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
            {product.storage && (
              <p className="mt-1 text-sm text-neutral-500">Объём памяти: {product.storage}</p>
            )}
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

            {countries.length > 0 && (
              <div className="mt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Страна производителя
                </p>
                <div className="flex flex-wrap gap-2">
                  {countries.map((mc, i) => {
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

            {product.description && (
              <p className="mt-5 text-sm leading-relaxed text-neutral-600">
                {product.description}
              </p>
            )}
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}
