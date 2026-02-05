import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Цена и валюта убраны из карточки товара (теперь в блоке Цвета). Делаем колонки nullable.
  await db.execute(
    sql.raw(
      `ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL`
    )
  );
  await db.execute(
    sql.raw(
      `ALTER TABLE "products" ALTER COLUMN "currency" DROP NOT NULL`
    )
  );
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(
      `UPDATE "products" SET "price" = 0 WHERE "price" IS NULL`
    )
  );
  await db.execute(
    sql.raw(
      `UPDATE "products" SET "currency" = 'RUB' WHERE "currency" IS NULL`
    )
  );
  await db.execute(
    sql.raw(`ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL`)
  );
  await db.execute(
    sql.raw(`ALTER TABLE "products" ALTER COLUMN "currency" SET NOT NULL`)
  );
}
