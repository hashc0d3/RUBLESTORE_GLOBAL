import { notFound } from 'next/navigation';
import { fetchPayload, fetchPayloadById } from '@/shared/lib/api';
import type { Product } from '@/entities/product';
import { ProductPageClient } from '@/views/catalog/ui/ProductPageClient';

/** Сколько похожих товаров показывать (в категории их больше — тянем с запасом и обрезаем) */
const SIMILAR_LIMIT = 16;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}

function getCategoryId(product: Product): number | null {
  const cat = product.category;
  if (cat == null) return null;
  return typeof cat === 'object' ? cat.id : cat;
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { returnTo } = await searchParams;

  const product = await fetchPayloadById<Product>('products', slug, {
    depth: 1,
  });
  if (!product || product.status !== 'published') {
    notFound();
  }

  const categoryId = getCategoryId(product);
  let similarProducts: Product[] = [];
  if (categoryId != null) {
    const res = await fetchPayload<Product>('products', {
      depth: 1,
      limit: 50,
      where: {
        status: { equals: 'published' },
        category: { equals: categoryId },
      },
    });
    similarProducts = res.docs
      .filter((p) => p.id !== product.id)
      .slice(0, SIMILAR_LIMIT);
  }

  return (
    <ProductPageClient
      product={product}
      returnTo={returnTo}
      similarProducts={similarProducts}
    />
  );
}

