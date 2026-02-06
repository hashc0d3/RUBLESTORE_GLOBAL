import { z } from 'zod';

/**
 * DTO категории из Payload/БД.
 * При несовпадении данных с БД Zod выдаст точное сообщение (какое поле не то или отсутствует).
 */
export const CategoryDto = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
}).passthrough();

export type CategoryDtoType = z.infer<typeof CategoryDto>;

export function parseCategories(docs: unknown): CategoryDtoType[] {
  const result = z.array(CategoryDto).safeParse(docs);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first.path.length ? first.path.join('.') : 'root';
    throw new Error(
      `[DTO] Категории: не совпадает с ожидаемой схемой. Поле: ${path}. ${first.message}. Подробности: ${JSON.stringify(result.error.format())}`
    );
  }
  return result.data;
}
