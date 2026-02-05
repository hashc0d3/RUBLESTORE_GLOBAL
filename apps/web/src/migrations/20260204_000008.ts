import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql.raw(
      `DO $$ BEGIN ALTER TABLE "products" ADD COLUMN "storage" TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$`
    )
  );
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(`ALTER TABLE "products" DROP COLUMN IF EXISTS "storage"`)
  );
}
