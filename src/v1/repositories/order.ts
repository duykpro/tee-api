import { Order } from '../models';

export enum OrderStatus {
  PendingPayment = 0,
  Processing,
  OnHold,
  Completed,
  Cancelled,
  Refunded,
  Failed
}

export interface OrderRepository {
  findById(id: string): Promise<Order>;
  create(data?: any): Promise<Order>;
  update(id: string, data: any): Promise<Order>;
}
