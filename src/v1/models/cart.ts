export type Cart = {
  id: string;
  invoice: CartInvoice;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type CartInvoice = {
  discounts: number;
  fees: number;
  shipping: number;
  subtotal: number;
  tax: number;
  total: number;
}

export type CartItem = {
  id: string;
  quantity: number;
  meta: {
    campaignId: string;
  };
}
