import { PersonInfo } from './personInfo';

export type Cart = {
  id: string;
  orderId: string;
  billing?: PersonInfo;
  shipping?: PersonInfo;
  invoice: CartInvoice;
  items: CartItem[];
  paymentMethod: string;
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
  meta?: {
    campaignId: string;
  };
}
