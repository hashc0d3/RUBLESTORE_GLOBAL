import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "categories" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "products_options" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "products_options_values" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "value" varchar NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "products_characteristics" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "option_name" varchar
    )`,
    `DO $$ BEGIN ALTER TABLE "products" ADD COLUMN "category_id" integer; EXCEPTION WHEN duplicate_column THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer; EXCEPTION WHEN duplicate_column THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "products_options_values" ADD CONSTRAINT "products_options_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_options"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "products_options" ADD CONSTRAINT "products_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "products_characteristics" ADD CONSTRAINT "products_characteristics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories" USING btree ("slug")`,
    `CREATE INDEX IF NOT EXISTS "categories_updated_at_idx" ON "categories" USING btree ("updated_at")`,
    `CREATE INDEX IF NOT EXISTS "categories_created_at_idx" ON "categories" USING btree ("created_at")`,
    `CREATE INDEX IF NOT EXISTS "products_options_values_order_idx" ON "products_options_values" USING btree ("_order")`,
    `CREATE INDEX IF NOT EXISTS "products_options_values_parent_id_idx" ON "products_options_values" USING btree ("_parent_id")`,
    `CREATE INDEX IF NOT EXISTS "products_options_order_idx" ON "products_options" USING btree ("_order")`,
    `CREATE INDEX IF NOT EXISTS "products_options_parent_id_idx" ON "products_options" USING btree ("_parent_id")`,
    `CREATE INDEX IF NOT EXISTS "products_characteristics_order_idx" ON "products_characteristics" USING btree ("_order")`,
    `CREATE INDEX IF NOT EXISTS "products_characteristics_parent_id_idx" ON "products_characteristics" USING btree ("_parent_id")`,
    `DO $$ BEGIN ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products" USING btree ("category_id")`,
    `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id")`,
  ]
  for (const stmt of statements) {
    await db.execute(sql.raw(stmt))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_options_values" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_characteristics" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "products_options_values" CASCADE;
  DROP TABLE "products_options" CASCADE;
  DROP TABLE "products_characteristics" CASCADE;
  ALTER TABLE "products" DROP CONSTRAINT "products_category_id_categories_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  DROP INDEX "products_category_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  ALTER TABLE "products" DROP COLUMN "category_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";`)
}
