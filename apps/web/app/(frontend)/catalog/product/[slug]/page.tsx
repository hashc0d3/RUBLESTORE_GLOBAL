import { notFound } from 'next/navigation';
import { fetchPayloadById } from '@/shared/lib/api';
import type { Product } from '@/entities/product';
import { ProductPageClient } from '@/views/catalog/ui/ProductPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { returnTo } = await searchParams;

  // slug здесь используем как ID товара
  const product = await fetchPayloadById<Product>('products', slug, {
    depth: 1,
  });
  if (!product || product.status !== 'published') {
    notFound();
  }

  return <ProductPageClient product={product} returnTo={returnTo} />;
}

