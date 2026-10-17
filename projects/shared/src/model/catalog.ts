export interface ProductSize {
  variantId: number;
  size: string;
  stockQuantity: number;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  color: string;
  fabric: string;
  tag: string | null;
  image: string | null;
  sizes: ProductSize[];
}

export interface ProductImage {
  id: number;
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number;
  color: string;
  fabric: string;
  tag: string | null;
  category: string;
  categorySlug: string;
  images: ProductImage[];
  sizes: ProductSize[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Page<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface ProductQuery {
  q?: string;
  category?: string;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  pageSize?: number;
}