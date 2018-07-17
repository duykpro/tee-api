type BaseRetailProduct = {
  id: string;
  name: string;
  sku: string;
  price: number;
  regularPrice: number;
  salePrice: number;
  isVirtual: boolean;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: RetailProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export type RetailProduct = BaseRetailProduct & {
  description: string;
  type: RetailProductType;
  status: RetailProductStatus;
  variants: RetailProductVariant[];
  attributes: RetailProductAttribute[];
  featuredImage: RetailProductImage;
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
  position: number;
  default: string;
  options: string[];
}

export interface RetailProductVariantAttribute {
  id: string;
  name: string;
  option: string;
}

export interface RetailProductImage {
  id: string;
  src: string;
  position: number;
  variantIds: string[];
}
