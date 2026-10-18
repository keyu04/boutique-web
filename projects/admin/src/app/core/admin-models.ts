export interface AdminProductSummary {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  price: number;
  mrp: number;
  costPrice: number;
  isActive: boolean;
  totalStock: number;
  image: string | null;
}

export interface AdminImage {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface AdminVariant {
  id: number;
  size: string;
  stockQuantity: number;
}

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number;
  color: string;
  fabric: string;
  price: number;
  mrp: number;
  costPrice: number;
  weightKg: number;
  tag: string | null;
  isActive: boolean;
  variants: AdminVariant[];
  images: AdminImage[];
}

/** Same body for create (POST) and update (PUT). */
export interface CreateProductRequest {
  name: string;
  categoryId: number;
  color: string;
  fabric: string;
  price: number;
  mrp: number;
  costPrice: number;
  weightKg: number;
  tag: string | null;
  stock: Record<string, number>;
}