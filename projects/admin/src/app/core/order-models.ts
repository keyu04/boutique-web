export interface AdminOrderSummary {
  id: number;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  phone: string;
  city: string;
  total: number;
  itemCount: number;
}

export interface AdminOrderItem {
  productId: number;
  variantId: number;
  productName: string;
  imageUrl?: string | null;
  size: string;
  unitPrice: number;
  unitCost?: number | null; // Admin only
  quantity: number;
  lineTotal: number;
}

export interface OrderHistoryEntry {
  from: string;
  to: string;
  changedBy: string;
  changedAt: string;
  note: string | null;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference: string | null;
  customerName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shippingCharge: number;
  total: number;
  courierName: string | null;
  trackingNumber: string | null;
  allowedNextStatuses: string[];
  items: AdminOrderItem[];
  history: OrderHistoryEntry[];
}

export interface ReportSummary {
  from: string;
  to: string;
  orderCount: number;
  itemRevenue: number;
  shippingCollected: number;
  cost: number;
  margin: number;
  marginPercent: number;
  ordersByStatus: Record<string, number>;
  shippingCost: number;
  netMargin: number;
  netMarginPercent: number;
}
