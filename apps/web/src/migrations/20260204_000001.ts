import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
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
    await db.execute(
      sql.raw(
        `INSERT INTO "categories" ("name", "slug") VALUES ('${name.replace(/'/g, "''")}', '${slug.replace(/'/g, "''")}') ON CONFLICT (slug) DO NOTHING`
      )
    );
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const slugs = SEED_CATEGORIES.map((c) => `'${c.slug.replace(/'/g, "''")}'`).join(', ');
  await db.execute(
    sql.raw(`DELETE FROM "categories" WHERE "slug" IN (${slugs})`)
  );
}
