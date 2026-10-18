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

export interface CreatedProduct {
  id: number;
  name: string;
  slug: string;
}