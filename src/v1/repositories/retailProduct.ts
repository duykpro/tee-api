import { RetailProduct } from '../models';

export interface RetailProductListParams {
  filter?: {
    ids?: string[];
  }
}

export interface RetailProductRepository {
  list(params?: RetailProductListParams): Promise<RetailProduct[]>;
  findById(id: string): Promise<RetailProduct>;
}
