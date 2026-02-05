import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "products_colors" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "color" varchar NOT NULL,
      "price" numeric NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "products_colors_images" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer,
      "alt" varchar
    )`,
    `DO $$ BEGIN ALTER TABLE "products_colors" ADD CONSTRAINT "products_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "products_colors_images" ADD CONSTRAINT "products_colors_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_colors"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "products_colors_images" ADD CONSTRAINT "products_colors_images_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `CREATE INDEX IF NOT EXISTS "products_colors_order_idx" ON "products_colors" USING btree ("_order")`,
    `CREATE INDEX IF NOT EXISTS "products_colors_parent_id_idx" ON "products_colors" USING btree ("_parent_id")`,
    `CREATE INDEX IF NOT EXISTS "products_colors_images_order_idx" ON "products_colors_images" USING btree ("_order")`,
    `CREATE INDEX IF NOT EXISTS "products_colors_images_parent_id_idx" ON "products_colors_images" USING btree ("_parent_id")`,
    `CREATE INDEX IF NOT EXISTS "products_colors_images_image_id_idx" ON "products_colors_images" USING btree ("image_id")`,
  ];
  for (const stmt of statements) {
    await db.execute(sql.raw(stmt));
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql.raw(`ALTER TABLE "products_colors_images" DROP CONSTRAINT IF EXISTS "products_colors_images_image_id_fk"`));
  await db.execute(sql.raw(`ALTER TABLE "products_colors_images" DROP CONSTRAINT IF EXISTS "products_colors_images_parent_id_fk"`));
  await db.execute(sql.raw(`ALTER TABLE "products_colors" DROP CONSTRAINT IF EXISTS "products_colors_parent_id_fk"`));
  await db.execute(sql.raw(`DROP TABLE IF EXISTS "products_colors_images" CASCADE`));
  await db.execute(sql.raw(`DROP TABLE IF EXISTS "products_colors" CASCADE`));
}
