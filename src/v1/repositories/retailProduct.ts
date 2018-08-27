import { RetailProduct } from '../models';

export enum RetailProductType {
  SingleProduct = 1,
  VariableProduct,
  ProductVariation
}

export enum RetailProductStatus {
  Published = 1
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
