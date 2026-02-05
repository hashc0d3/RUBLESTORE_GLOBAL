'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { CatalogFilters } from './CatalogFilters';
import { ProductGrid } from './ProductGrid';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';
import type { Category } from '@/entities/category';
import type { Product } from '@/entities/product';

export interface CategorySection {
  category: Category;
  products: Product[];
}

interface CatalogPageClientProps {
  categories: Category[];
  categorySections: CategorySection[];
  selectedCategorySlugs: string[];
  selectedStorage: string[];
  catalogReturnQuery: string;
}

function matchesSearch(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return product.title.toLowerCase().includes(q);
}

export function CatalogPageClient({
  categories,
  categorySections,
  selectedCategorySlugs,
  selectedStorage,
  catalogReturnQuery,
}: CatalogPageClientProps) {
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const applySearch = () => {
    setAppliedSearch(searchInput.trim());
    setShowSuggestions(false);
  };

  // Все товары каталога для подсказок (плоский список)
  const allProducts = useMemo(
    () => categorySections.flatMap((s) => s.products),
    [categorySections]
  );

  // Подсказки при вводе — товары из общего списка, подходящие по запросу
  const suggestionProducts = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return [];
    return allProducts.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 10);
  }, [allProducts, searchInput]);

  useEffect(() => {
    if (!searchInput.trim()) setShowSuggestions(false);
    else setShowSuggestions(true);
  }, [searchInput]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSections = useMemo(() => {
    if (!appliedSearch) return categorySections;
    return categorySections
      .map((section) => ({
        ...section,
        products: section.products.filter((p) => matchesSearch(p, appliedSearch)),
      }))
      .filter((section) => section.products.length > 0);
  }, [categorySections, appliedSearch]);

  const selectedCategory =
    selectedCategorySlugs.length === 1
      ? categories.find((c) => c.slug === selectedCategorySlugs[0])
      : null;

  return (
    <main>
      <div className="w-full bg-neutral-100 py-4">
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            categoryName={selectedCategory?.name}
            categorySlug={selectedCategory?.slug}
          />
        </div>
      </div>

      <header className="w-full bg-white py-6">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">
              Каталог
            </h1>
            <Link
              href="/"
              className="text-sm text-neutral-600 transition hover:text-neutral-900"
            >
              ← На главную
            </Link>
          </div>

          {/* Поиск по товарам — подсказки при вводе, кнопка «Найти» применяет к списку ниже */}
          <div className="mb-4 flex flex-wrap items-center gap-2" ref={searchWrapRef}>
            <div className="relative flex-1 min-w-0 md:max-w-sm">
              <label htmlFor="catalog-search" className="sr-only">
                Поиск по товарам
              </label>
              <input
                id="catalog-search"
                type="search"
                placeholder="Поиск по названию товара..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applySearch())}
                className="w-full rounded-full border-2 border-dashed border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400/20 focus:ring-offset-0"
                autoComplete="off"
              />
              {showSuggestions && searchInput.trim() && (
                <div
                  className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-2xl border border-neutral-200 bg-white py-2 shadow-lg"
                  role="listbox"
                  aria-label="Подходящие товары"
                >
                  {suggestionProducts.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-neutral-500">Ничего не найдено</p>
                  ) : (
                    suggestionProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={
                          catalogReturnQuery
                            ? `/catalog/product/${product.id}?returnTo=${encodeURIComponent('/catalog?' + catalogReturnQuery)}`
                            : `/catalog/product/${product.id}`
                        }
                        role="option"
                        className="block px-4 py-2.5 text-sm text-neutral-900 transition hover:bg-neutral-100"
                      >
                        {product.title}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={applySearch}
              className="shrink-0 rounded-full border-2 border-neutral-900 bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 hover:border-neutral-800"
            >
              Найти
            </button>
          </div>

          <CatalogFilters
            categories={categories}
            selectedCategorySlugs={selectedCategorySlugs}
            selectedStorage={selectedStorage}
          />
        </div>
      </header>

      {filteredSections.length === 0 ? (
        <div className="w-full bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <p className="text-neutral-600">
              {appliedSearch
                ? 'По запросу ничего не найдено. Измените поиск или фильтры.'
                : 'В выбранных фильтрах нет товаров.'}
            </p>
          </div>
        </div>
      ) : (
        filteredSections.map(({ category, products: categoryProducts }, index) => (
          <div key={category.id}>
            {index > 0 && <div className="h-2 w-full bg-neutral-100" aria-hidden />}
            <section className="w-full bg-white py-6">
              <div className="mx-auto max-w-6xl px-4">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
                  {category.name}
                </h2>
                <p className="-mt-2 mb-4 text-sm text-neutral-500">
                  {categoryProducts.length} {categoryProducts.length === 1 ? 'товар' : categoryProducts.length >= 2 && categoryProducts.length <= 4 ? 'товара' : 'товаров'}
                </p>
              </div>
              <ProductGrid
                products={categoryProducts}
                catalogReturnQuery={catalogReturnQuery}
              />
            </section>
          </div>
        ))
      )}
    </main>
  );
}
