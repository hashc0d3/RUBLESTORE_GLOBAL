import { fetchPayload } from '@/shared/lib/api';
import type { Category } from '@/entities/category';
import type { Product } from '@/entities/product';
import { CatalogPage } from '@/views/catalog';

const STORAGE_VALUES = ['256GB', '512GB', '1024GB', '2048GB'];

interface PageProps {
  searchParams: Promise<{ category?: string | string[]; storage?: string | string[] }>;
}

export default async function CatalogRoute({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const rawCategory = resolved.category;
  const categorySlugs =
    rawCategory == null ? [] : Array.isArray(rawCategory) ? rawCategory : [rawCategory];
  const rawStorage = resolved.storage;
  const storageValues =
    rawStorage == null ? [] : Array.isArray(rawStorage) ? rawStorage : [rawStorage];
  const validStorage = storageValues.filter((s) => STORAGE_VALUES.includes(s));

  const categoriesRes = await fetchPayload<Category>('categories', {
    limit: 100,
  });
  const categories = categoriesRes.docs;

  const selectedCategoryIds = categories
    .filter((c) => categorySlugs.includes(c.slug))
    .map((c) => c.id);

  const productsRes = await fetchPayload<Product>('products', {
    depth: 1,
    limit: 50,
    where: {
      status: { equals: 'published' },
      ...(selectedCategoryIds.length
        ? { category: { in: selectedCategoryIds } }
        : {}),
      ...(validStorage.length ? { storage: { in: validStorage } } : {}),
    },
  });
  const products = productsRes.docs;

  return (
    <CatalogPage
      categories={categories}
      products={products}
      selectedCategorySlugs={categorySlugs}
      selectedStorage={validStorage}
    />
  );
}
