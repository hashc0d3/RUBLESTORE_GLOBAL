import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "products_colors_manufacturer_countries" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "country" varchar NOT NULL,
      "price" numeric NOT NULL
    )`,
    `DO $$ BEGIN ALTER TABLE "products_colors_manufacturer_countries" ADD CONSTRAINT "products_colors_manufacturer_countries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_colors"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `CREATE INDEX IF NOT EXISTS "products_colors_manufacturer_countries_order_idx" ON "products_colors_manufacturer_countries" USING btree ("_order")`,
    `CREATE INDEX IF NOT EXISTS "products_colors_manufacturer_countries_parent_id_idx" ON "products_colors_manufacturer_countries" USING btree ("_parent_id")`,
    `ALTER TABLE "products_colors" ALTER COLUMN "price" DROP NOT NULL`,
  ];
  for (const stmt of statements) {
    await db.execute(sql.raw(stmt));
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(
      `UPDATE "products_colors" SET "price" = 0 WHERE "price" IS NULL`
    )
  );
  await db.execute(
    sql.raw(`ALTER TABLE "products_colors" ALTER COLUMN "price" SET NOT NULL`)
  );
  await db.execute(
    sql.raw(
      `ALTER TABLE "products_colors_manufacturer_countries" DROP CONSTRAINT IF EXISTS "products_colors_manufacturer_countries_parent_id_fk"`
    )
  );
  await db.execute(
    sql.raw(`DROP TABLE IF EXISTS "products_colors_manufacturer_countries" CASCADE`)
  );
}
