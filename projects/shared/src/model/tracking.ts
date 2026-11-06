export interface TrackItem {
  productName: string;
  size: string;
  quantity: number;
}

export interface TrackStep {
  status: string;
  at: string;
}

export interface TrackedOrder {
  orderNumber: string;
  status: string;
  placedAt: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  courierName: string | null;
  trackingNumber: string | null;
  items: TrackItem[];
  timeline: TrackStep[];
}
