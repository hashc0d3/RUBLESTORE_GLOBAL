import { getPayload } from 'payload';
import config from '@payload-config';
import { NextRequest, NextResponse } from 'next/server';

const SEED_SECRET =
  process.env.SEED_SECRET || 'ruble-store-seed-dev-do-not-use-in-production';

/** Категории для сида (slug -> name): Mac, Аксессуары, AirPods, iPhone, Watch */
const SEED_CATEGORIES: Record<string, string> = {
  mac: 'Mac',
  accessories: 'Аксессуары',
  airpods: 'AirPods',
  iphone: 'iPhone',
  watch: 'Watch',
};

/** Минимальные товары: title, slug, categorySlug */
const SEED_PRODUCTS: { title: string; slug: string; categorySlug: string }[] = [
  { title: 'MacBook Pro', slug: 'macbook-pro', categorySlug: 'mac' },
  { title: 'Mac mini', slug: 'mac-mini', categorySlug: 'mac' },
  { title: 'Чехол для iPhone', slug: 'iphone-case', categorySlug: 'accessories' },
  { title: 'Зарядка USB-C', slug: 'usb-c-charger', categorySlug: 'accessories' },
  { title: 'AirPods Pro 2', slug: 'airpods-pro-2', categorySlug: 'airpods' },
  { title: 'AirPods 3', slug: 'airpods-3', categorySlug: 'airpods' },
  { title: 'iPhone 16 Pro', slug: 'iphone-16-pro', categorySlug: 'iphone' },
  { title: 'iPhone 16', slug: 'iphone-16', categorySlug: 'iphone' },
  { title: 'Apple Watch Ultra 2', slug: 'apple-watch-ultra-2', categorySlug: 'watch' },
  { title: 'Apple Watch Series 10', slug: 'apple-watch-series-10', categorySlug: 'watch' },
];

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  if (key !== SEED_SECRET) {
    return NextResponse.json(
      { error: 'Invalid or missing key. Set ?key=SEED_SECRET.' },
      { status: 401 }
    );
  }

  try {
    const payload = await getPayload({ config });
    const createdCategories: string[] = [];
    const createdProducts: string[] = [];
    const categoryIds: Record<string, number> = {};

    // Категории: найти или создать
    for (const [slug, name] of Object.entries(SEED_CATEGORIES)) {
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
      });
      if (existing.docs.length > 0) {
        categoryIds[slug] = existing.docs[0].id;
        continue;
      }
      const created = await payload.create({
        collection: 'categories',
        data: { name, slug },
      });
      categoryIds[slug] = created.id;
      createdCategories.push(slug);
    }

    // Товары: создать только если ещё нет ни одного
    const existingProducts = await payload.find({
      collection: 'products',
      limit: 1,
      depth: 0,
    });
    if (existingProducts.docs.length === 0) {
      for (const p of SEED_PRODUCTS) {
        const categoryId = categoryIds[p.categorySlug];
        if (!categoryId) continue;
        await payload.create({
          collection: 'products',
          data: {
            title: p.title,
            slug: p.slug,
            category: categoryId,
            status: 'published',
          },
        });
        createdProducts.push(p.slug);
      }
    }

    return NextResponse.json({
      ok: true,
      categories: {
        created: createdCategories,
        total: Object.keys(SEED_CATEGORIES).length,
      },
      products: {
        created: createdProducts,
        skipped: existingProducts.docs.length > 0 ? 'already have products' : false,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
