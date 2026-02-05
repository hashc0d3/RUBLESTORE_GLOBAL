import type { Category } from '@/entities/category';

export interface ProductColorImage {
  image: number | { url?: string; alt?: string; id?: number };
  imageUrl?: string | null;
  alt?: string;
}

export interface ProductSimTypeVariant {
  simType: string;
  price: number;
}

export interface ProductManufacturerCountry {
  country: string;
  simTypes?: ProductSimTypeVariant[];
}

export interface ProductColor {
  color: string;
  manufacturerCountries?: ProductManufacturerCountry[];
  images?: ProductColorImage[];
}

export type ProductStorage = '256GB' | '512GB' | '1024GB' | '2048GB';

export interface Product {
  id: number | string;
  title: string;
  slug: string;
  description?: string | null;
  status: 'draft' | 'published';
  storage?: ProductStorage | string | null;
  category?: number | Category;
  colors?: ProductColor[] | null;
}
