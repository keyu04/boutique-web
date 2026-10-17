export interface CreateOrderRequest {
  items: { variantId: number; quantity: number }[];
  customerName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'Prepaid' | 'Cod';
}

export interface OrderResult {
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}