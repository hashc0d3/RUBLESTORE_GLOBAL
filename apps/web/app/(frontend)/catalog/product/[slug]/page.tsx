import { notFound } from 'next/navigation';
import { getPayloadServer } from '@/shared/lib/payload-server';
import { parseProduct, parseProducts } from '@/shared/dto';
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

  const payload = await getPayloadServer();
  const productDoc = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  const rawProduct = productDoc.docs[0];
  if (!rawProduct || rawProduct.status !== 'published') {
    notFound();
  }
  const product = parseProduct(rawProduct) as Product;

  const categoryId = getCategoryId(product);
  let similarProducts: Product[] = [];
  if (categoryId != null) {
    const similarRes = await payload.find({
      collection: 'products',
      depth: 1,
      limit: 50,
      where: {
        status: { equals: 'published' },
        category: { equals: categoryId },
      },
    });
    const allSimilar = parseProducts(
      similarRes.docs.filter((p) => p.id !== product.id)
    );
    similarProducts = allSimilar.slice(0, SIMILAR_LIMIT) as Product[];
  }

  return (
    <ProductPageClient
      product={product}
      returnTo={returnTo}
      similarProducts={similarProducts}
    />
  );
}

