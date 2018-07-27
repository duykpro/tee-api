import { PersonInfo } from './personInfo';

export type Order = {
  id: string;
  orderId: string;
  billing?: PersonInfo;
  shipping?: PersonInfo;
  invoice: CartInvoice;
  items: Order[];
  customerNote: string;
  paymentMethod: string;
  transactionId: string;
  paidAt: Date;
  completedAt: Date;
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

export type OrderItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}
