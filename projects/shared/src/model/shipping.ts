export interface ShippingEstimateRequest {
  pincode: string;
  paymentMethod: string; // 'Prepaid' for now. COD comes with checkout.
  items: { variantId: number; quantity: number }[];
}

export interface ShippingEstimate {
  charge: number;
  eta: string;
  chargeableWeightKg: number;
}