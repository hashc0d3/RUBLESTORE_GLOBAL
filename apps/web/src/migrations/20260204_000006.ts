import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql.raw(
      `DO $$ BEGIN ALTER TABLE "products_colors_manufacturer_countries" ADD COLUMN "sim_type" varchar; EXCEPTION WHEN duplicate_column THEN NULL; END $$`
    )
  );
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(
      `ALTER TABLE "products_colors_manufacturer_countries" DROP COLUMN IF EXISTS "sim_type"`
    )
  );
}
