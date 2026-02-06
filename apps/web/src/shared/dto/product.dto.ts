import { z } from 'zod';

/** Изображение цвета товара */
const ProductColorImageDto = z.object({
  image: z.union([z.number(), z.object({ url: z.string().optional(), alt: z.string().optional(), id: z.number().optional() })]),
  imageUrl: z.string().nullable().optional(),
  alt: z.string().optional(),
  id: z.union([z.string(), z.number()]).optional(),
});

/** Вариант SIM (тип + цена) */
const ProductSimTypeVariantDto = z.object({
  simType: z.string(),
  price: z.number(),
});

/** Страна производителя */
const ProductManufacturerCountryDto = z.object({
  country: z.string(),
  simTypes: z.array(ProductSimTypeVariantDto).optional(),
});

/** Цвет товара */
const ProductColorDto = z.object({
  color: z.string(),
  manufacturerCountries: z.array(ProductManufacturerCountryDto).optional(),
  images: z.array(ProductColorImageDto).optional(),
  id: z.union([z.string(), z.number()]).optional(),
});

const ProductStorageDto = z.enum(['256GB', '512GB', '1024GB', '2048GB']);

/**
 * DTO товара из Payload/БД.
 * При несовпадении данных с БД Zod выдаст точное сообщение (какое поле не то или отсутствует).
 */
export const ProductDto = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(['draft', 'published']),
  storage: ProductStorageDto.nullable().optional(),
  category: z.union([z.number(), z.object({ id: z.number(), name: z.string().optional(), slug: z.string().optional() })]).optional(),
  colors: z.array(ProductColorDto).nullable().optional(),
}).passthrough();

export type ProductDtoType = z.infer<typeof ProductDto>;

export function parseProducts(docs: unknown): ProductDtoType[] {
  const result = z.array(ProductDto).safeParse(docs);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first.path.length ? first.path.join('.') : 'root';
    throw new Error(
      `[DTO] Товары: не совпадает с ожидаемой схемой. Поле: ${path}. ${first.message}. Подробности: ${JSON.stringify(result.error.format())}`
    );
  }
  return result.data;
}

export function parseProduct(doc: unknown): ProductDtoType {
  const result = ProductDto.safeParse(doc);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first.path.length ? first.path.join('.') : 'root';
    throw new Error(
      `[DTO] Товар: не совпадает с ожидаемой схемой. Поле: ${path}. ${first.message}. Подробности: ${JSON.stringify(result.error.format())}`
    );
  }
  return result.data;
}
