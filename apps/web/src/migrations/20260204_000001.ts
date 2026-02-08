import type { MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

const SEED_CATEGORIES = [
  { name: 'Mac', slug: 'mac' },
  { name: 'iPad', slug: 'ipad' },
  { name: 'iPhone', slug: 'iphone' },
  { name: 'Watch', slug: 'watch' },
  { name: 'Vision', slug: 'vision' },
  { name: 'AirPods', slug: 'airpods' },
  { name: 'TV & Home', slug: 'tv-home' },
  { name: 'Entertainment', slug: 'entertainment' },
  { name: 'Accessories', slug: 'accessories' },
] as const;

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { name, slug } of SEED_CATEGORIES) {
    // ИСПРАВЛЕНО: используем параметризованные запросы вместо конкатенации строк
    await db.execute(
      sql`INSERT INTO "categories" ("name", "slug") VALUES (${name}, ${slug}) ON CONFLICT (slug) DO NOTHING`
    );
  }
}

export async function down({ db }: MigrateUpArgs): Promise<void> {
  const slugs = SEED_CATEGORIES.map((c) => c.slug);
  // ИСПРАВЛЕНО: используем VARIADIC параметры вместо IN (...)
  // Удаляем только категории, которые мы создали
  for (const slug of slugs) {
    await db.execute(
      sql`DELETE FROM "categories" WHERE "slug" = ${slug}`
    );
  }
}

