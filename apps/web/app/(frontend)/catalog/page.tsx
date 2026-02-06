import { getPayloadServer } from '@/shared/lib/payload-server';
import { parseCategories, parseProducts } from '@/shared/dto';
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

  const payload = await getPayloadServer();

  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 100,
    depth: 0,
  });
  const categories = parseCategories(categoriesRes.docs) as Category[];

  const selectedCategoryIds = categories
    .filter((c) => categorySlugs.includes(c.slug))
    .map((c) => c.id);

  const productsWhere: Record<string, unknown> = {
    status: { equals: 'published' },
  };
  if (selectedCategoryIds.length === 1) {
    productsWhere.category = { equals: selectedCategoryIds[0] };
  } else if (selectedCategoryIds.length > 1) {
    productsWhere.category = { in: selectedCategoryIds };
  }
  if (validStorage.length === 1) {
    productsWhere.storage = { equals: validStorage[0] };
  } else if (validStorage.length > 1) {
    productsWhere.storage = { in: validStorage };
  }

  const productsRes = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 50,
    where: productsWhere,
  });
  const products = parseProducts(productsRes.docs) as Product[];

  return (
    <CatalogPage
      categories={categories}
      products={products}
      selectedCategorySlugs={categorySlugs}
      selectedStorage={validStorage}
    />
  );
}
