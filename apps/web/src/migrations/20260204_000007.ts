import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "products_colors_manufacturer_countries_sim_types" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "sim_type" varchar NOT NULL,
      "price" numeric NOT NULL
    )`,
    `DO $$ BEGIN ALTER TABLE "products_colors_manufacturer_countries_sim_types" ADD CONSTRAINT "products_colors_manufacturer_countries_sim_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_colors_manufacturer_countries"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `CREATE INDEX IF NOT EXISTS "products_colors_mc_sim_types_order_idx" ON "products_colors_manufacturer_countries_sim_types" USING btree ("_order")`,
    `CREATE INDEX IF NOT EXISTS "products_colors_mc_sim_types_parent_id_idx" ON "products_colors_manufacturer_countries_sim_types" USING btree ("_parent_id")`,
  ];
  for (const stmt of statements) {
    await db.execute(sql.raw(stmt));
  }
  // Переносим существующие данные: одна строка (country, sim_type, price) -> одна строка в sim_types
  await db.execute(
    sql.raw(`
      INSERT INTO "products_colors_manufacturer_countries_sim_types" ("_order", "_parent_id", "id", "sim_type", "price")
      SELECT 0, "id", "id" || '_st0', COALESCE("sim_type", 'sim-esim'), COALESCE("price", 0)
      FROM "products_colors_manufacturer_countries"
      WHERE "price" IS NOT NULL OR "sim_type" IS NOT NULL
    `)
  );
  // Удаляем колонки price и sim_type из родительской таблицы
  await db.execute(
    sql.raw(
      `DO $$ BEGIN ALTER TABLE "products_colors_manufacturer_countries" DROP COLUMN "price"; EXCEPTION WHEN undefined_column THEN NULL; END $$`
    )
  );
  await db.execute(
    sql.raw(
      `DO $$ BEGIN ALTER TABLE "products_colors_manufacturer_countries" DROP COLUMN "sim_type"; EXCEPTION WHEN undefined_column THEN NULL; END $$`
    )
  );
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(
      `DO $$ BEGIN ALTER TABLE "products_colors_manufacturer_countries" ADD COLUMN "price" numeric; EXCEPTION WHEN duplicate_column THEN NULL; END $$`
    )
  );
  await db.execute(
    sql.raw(
      `DO $$ BEGIN ALTER TABLE "products_colors_manufacturer_countries" ADD COLUMN "sim_type" varchar; EXCEPTION WHEN duplicate_column THEN NULL; END $$`
    )
  );
  await db.execute(
    sql.raw(
      `ALTER TABLE "products_colors_manufacturer_countries_sim_types" DROP CONSTRAINT IF EXISTS "products_colors_manufacturer_countries_sim_types_parent_id_fk"`
    )
  );
  await db.execute(
    sql.raw(
      `DROP TABLE IF EXISTS "products_colors_manufacturer_countries_sim_types" CASCADE`
    )
  );
}
