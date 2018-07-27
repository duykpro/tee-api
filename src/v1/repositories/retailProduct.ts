import { RetailProduct } from '../models';

export enum Type {
  GroupedProduct = 2,
  VariableProduct = 3,
  ProductVariation = 4
}

export interface RetailProductListParams {
  filter?: {
    ids?: string[];
  }
}

export interface RetailProductRepository {
  list(params?: RetailProductListParams): Promise<RetailProduct[]>;
  findById(id: string): Promise<RetailProduct>;
}
