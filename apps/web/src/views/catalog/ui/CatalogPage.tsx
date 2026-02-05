import Link from 'next/link';
import { Suspense } from 'react';
import { CatalogFilters } from './CatalogFilters';
import { ProductGrid } from './ProductGrid';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';
import type { Category } from '@/entities/category';
import type { Product } from '@/entities/product';

interface CatalogPageProps {
  categories: Category[];
  products: Product[];
  selectedCategorySlugs: string[];
  selectedStorage: string[];
}

function getProductCategoryId(product: { category?: number | { id: number } }): number | null {
  const cat = product.category;
  if (cat == null) return null;
  return typeof cat === 'object' ? cat.id : cat;
}

export function CatalogPage({
  categories,
  products,
  selectedCategorySlugs,
  selectedStorage = [],
}: CatalogPageProps) {
  // Если выбрана одна категория, показываем её в хлебных крошках
  const selectedCategory =
    selectedCategorySlugs.length === 1
      ? categories.find((c) => c.slug === selectedCategorySlugs[0])
      : null;

  // Группируем товары по категории (сохраняем порядок категорий)
  const productsByCategoryId = new Map<number, typeof products>();
  for (const product of products) {
    const categoryId = getProductCategoryId(product);
    if (categoryId != null) {
      const list = productsByCategoryId.get(categoryId) ?? [];
      list.push(product);
      productsByCategoryId.set(categoryId, list);
    }
  }

  const categorySections = categories
    .map((category) => ({
      category,
      products: productsByCategoryId.get(category.id) ?? [],
    }))
    .filter(({ products: p }) => p.length > 0);

  // Строка запроса каталога для возврата из карточки товара с теми же фильтрами
  const catalogReturnQuery = [
    ...selectedCategorySlugs.map((s) => `category=${encodeURIComponent(s)}`),
    ...selectedStorage.map((s) => `storage=${encodeURIComponent(s)}`),
  ].join('&');

  return (
    <main>
      {/* Зебра: серый — белый. Хлебные крошки на сером. */}
      <div className="w-full bg-neutral-100 py-4">
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            categoryName={selectedCategory?.name}
            categorySlug={selectedCategory?.slug}
          />
        </div>
      </div>

      {/* Каталог и фильтры на белом. Отступ сверху и снизу одинаковый (py-6). */}
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
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-neutral-200" />}>
            <CatalogFilters
              categories={categories}
              selectedCategorySlugs={selectedCategorySlugs}
              selectedStorage={selectedStorage}
            />
          </Suspense>
        </div>
      </header>

      {/* Зебра: товары на белом, между секциями — серая полоса. */}
      {categorySections.map(({ category, products: categoryProducts }, index) => (
        <div key={category.id}>
          {index > 0 && <div className="h-2 w-full bg-neutral-100" aria-hidden />}
          <section className="w-full bg-white py-6">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
                {category.name}
              </h2>
            </div>
            <ProductGrid products={categoryProducts} catalogReturnQuery={catalogReturnQuery} />
          </section>
        </div>
      ))}
    </main>
  );
}
