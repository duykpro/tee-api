import { PersonInfo } from './personInfo';

export type Order = {
  id: string;
  billing?: PersonInfo;
  shipping?: PersonInfo;
  total: number;
  details: OrderDetails;
  items: OrderItem[];
  customerNote: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  isPaid: boolean;
  paidAt: Date;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDetails = {
  discounts: number;
  fees: number;
  shipping: number;
  tax: number;
  subtotal: number;
}

export type OrderItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
  total: number;
}
