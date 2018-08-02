type BaseRetailProduct = {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  regularPrice?: number;
  salePrice?: number;
  weight?: number;
  metadata?: {
    [k: string]: {
      [k: string]: string;
    };
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: RetailProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export type RetailProduct = BaseRetailProduct & {
  description?: string;
  type?: RetailProductType;
  status?: RetailProductStatus;
  linkedProducts?: RetailProduct[];
  variants?: RetailProductVariant[];
  attributes?: RetailProductAttribute[];
  featuredImage?: RetailProductImage;
  related: RetailProduct[];
}

export enum RetailProductType {
  Variable = 'variable',
}

export enum RetailProductStatus {
  Publish = 'publish',
}

export interface RetailProductVariant extends BaseRetailProduct {
  attributes: RetailProductVariantAttribute[];
}

export interface RetailProductAttribute {
  id: string;
  name: string;
  type: string;
  default: string;
  options: {
    cost?: number;
    label?: string;
    value?: string;
  }[];
}

export interface RetailProductVariantAttribute {
  id: string;
  value: string;
}

export interface RetailProductImage {
  id: string;
  src: string;
  position: number;
  variantIds?: string[];
}
