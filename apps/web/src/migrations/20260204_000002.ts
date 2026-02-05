import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

const SEED_PRODUCTS: Array<{
  categorySlug: string;
  title: string;
  slug: string;
  description: string;
  price: number;
}> = [
  // 5 iPhone
  {
    categorySlug: 'iphone',
    title: 'iPhone 15 Pro',
    slug: 'iphone-15-pro',
    description: 'Титановый корпус, чип A17 Pro, камера 48 Мп, USB-C.',
    price: 119990,
  },
  {
    categorySlug: 'iphone',
    title: 'iPhone 15',
    slug: 'iphone-15',
    description: 'Динамический остров, камера 48 Мп, USB-C.',
    price: 89990,
  },
  {
    categorySlug: 'iphone',
    title: 'iPhone 14',
    slug: 'iphone-14',
    description: 'Чип A15 Bionic, две камеры 12 Мп.',
    price: 69990,
  },
  {
    categorySlug: 'iphone',
    title: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    description: 'Максимальный экран и батарея, титан, A17 Pro.',
    price: 134990,
  },
  {
    categorySlug: 'iphone',
    title: 'iPhone SE',
    slug: 'iphone-se',
    description: 'Компактный iPhone с чипом A15 Bionic.',
    price: 49990,
  },
  // 2 Mac
  {
    categorySlug: 'mac',
    title: 'MacBook Air M3',
    slug: 'macbook-air-m3',
    description: 'Тонкий ноутбук на чипе M3, до 18 часов работы.',
    price: 119990,
  },
  {
    categorySlug: 'mac',
    title: 'MacBook Pro 14"',
    slug: 'macbook-pro-14',
    description: 'M3 Pro или M3 Max, дисплей Liquid Retina XDR.',
    price: 199990,
  },
  // 2 iPad
  {
    categorySlug: 'ipad',
    title: 'iPad Pro',
    slug: 'ipad-pro',
    description: 'Чип M2, дисплей Liquid Retina, поддержка Apple Pencil.',
    price: 99990,
  },
  {
    categorySlug: 'ipad',
    title: 'iPad Air',
    slug: 'ipad-air',
    description: 'M1, 10.9", отличный экран и автономность.',
    price: 64990,
  },
  // 2 Watch
  {
    categorySlug: 'watch',
    title: 'Apple Watch Series 9',
    slug: 'apple-watch-series-9',
    description: 'Двойной тап, яркий экран, чип S9.',
    price: 39990,
  },
  {
    categorySlug: 'watch',
    title: 'Apple Watch Ultra 2',
    slug: 'apple-watch-ultra-2',
    description: 'Для экстремальных условий, титан, 49 мм.',
    price: 89990,
  },
  // 2 Vision
  {
    categorySlug: 'vision',
    title: 'Apple Vision Pro',
    slug: 'apple-vision-pro',
    description: 'Пространственные вычисления, дисплеи 4K на каждый глаз.',
    price: 349990,
  },
  {
    categorySlug: 'vision',
    title: 'Apple Vision Pro (256 ГБ)',
    slug: 'apple-vision-pro-256',
    description: 'Расширенный объём хранения для приложений и контента.',
    price: 369990,
  },
  // 2 AirPods
  {
    categorySlug: 'airpods',
    title: 'AirPods Pro 2',
    slug: 'airpods-pro-2',
    description: 'Активное шумоподавление, прозрачный режим, USB-C.',
    price: 24990,
  },
  {
    categorySlug: 'airpods',
    title: 'AirPods Max',
    slug: 'airpods-max',
    description: 'Накладные наушники с пространственным звуком.',
    price: 59990,
  },
  // 2 TV & Home
  {
    categorySlug: 'tv-home',
    title: 'Apple TV 4K',
    slug: 'apple-tv-4k',
    description: 'Стриминг в 4K HDR, чип A15 Bionic, Siri Remote.',
    price: 14990,
  },
  {
    categorySlug: 'tv-home',
    title: 'HomePod',
    slug: 'homepod',
    description: 'Умная колонка с пространственным звуком и Siri.',
    price: 22990,
  },
  // 2 Entertainment
  {
    categorySlug: 'entertainment',
    title: 'Apple Music (подписка)',
    slug: 'apple-music-subscription',
    description: 'Безлимитная музыка и аудиокниги без рекламы.',
    price: 169,
  },
  {
    categorySlug: 'entertainment',
    title: 'Apple TV+ (подписка)',
    slug: 'apple-tv-plus-subscription',
    description: 'Оригинальные сериалы и фильмы Apple.',
    price: 299,
  },
  // 2 Accessories
  {
    categorySlug: 'accessories',
    title: 'MagSafe зарядное устройство',
    slug: 'magsafe-charger',
    description: 'Беспроводная зарядка 15 Вт для iPhone с MagSafe.',
    price: 4990,
  },
  {
    categorySlug: 'accessories',
    title: 'Чехол Silicone с MagSafe',
    slug: 'iphone-case-silicone-magsafe',
    description: 'Силиконовый чехол с поддержкой MagSafe для iPhone.',
    price: 4990,
  },
];

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const p of SEED_PRODUCTS) {
    const title = "'" + esc(p.title) + "'";
    const slug = "'" + esc(p.slug) + "'";
    const description = "'" + esc(p.description) + "'";
    const catSlug = "'" + esc(p.categorySlug) + "'";
    await db.execute(
      sql.raw(
        `INSERT INTO "products" ("title", "slug", "description", "price", "currency", "status", "category_id")
        SELECT ${title}, ${slug}, ${description}, ${p.price}, 'RUB', 'published', c.id
        FROM "categories" c
        WHERE c.slug = ${catSlug}
        LIMIT 1
        ON CONFLICT (slug) DO NOTHING`
      )
    );
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const slugs = SEED_PRODUCTS.map((p) => `'${esc(p.slug)}'`).join(', ');
  await db.execute(
    sql.raw(`DELETE FROM "products" WHERE "slug" IN (${slugs})`)
  );
}
