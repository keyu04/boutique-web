export interface ShippingEstimateRequest {
  pincode: string;
  paymentMethod: 'Prepaid' | 'Cod';
  items: { variantId: number; quantity: number }[];
}

export interface ShippingEstimate {
  charge: number;
  eta: string;
  chargeableWeightKg: number;
  standardCharge: number;
  saving: number;
  amountToFreeDelivery: number;
  freeDeliveryAtSubtotal: number | null;
  prepaidSaving: number | null;
  deliveryBy: string | null;   // "2026-11-14"
}
