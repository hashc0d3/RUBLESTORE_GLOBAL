import { CatalogPageClient } from './CatalogPageClient';
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
  const productsByCategoryId = new Map<number, Product[]>();
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

  const catalogReturnQuery = [
    ...selectedCategorySlugs.map((s) => `category=${encodeURIComponent(s)}`),
    ...selectedStorage.map((s) => `storage=${encodeURIComponent(s)}`),
  ].join('&');

  return (
    <CatalogPageClient
      categories={categories}
      categorySections={categorySections}
      selectedCategorySlugs={selectedCategorySlugs}
      selectedStorage={selectedStorage}
      catalogReturnQuery={catalogReturnQuery}
    />
  );
}
