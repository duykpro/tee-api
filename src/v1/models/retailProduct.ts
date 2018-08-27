type BaseRetailProduct = {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  regularPrice?: number;
  salePrice?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  metadata?: {
    [k: string]: {
      [k: string]: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export type RetailProduct = BaseRetailProduct & {
  description?: string;
  attributes?: RetailProductAttribute[];
  variants?: RetailProductVariant[];
  images?: RetailProductImage[];
  featuredImage?: RetailProductImage;
  linkedIds?: string[];
  relatedIds?: string[];
  type?: RetailProductType;
  status?: RetailProductStatus;
}

export interface RetailProductAttribute {
  id: string;
  name: string;
  default: string;
  options: string[];
  position: number;
}

export interface RetailProductImage {
  id: string;
  src: string;
  position: number;
  metadata?: {
    [k: string]: {
      [k: string]: string;
    };
  };
  variantIds?: string[];
}

export type RetailProductType = 'single' | 'variable';

export type RetailProductStatus = 'published';

export type RetailProductVariant = BaseRetailProduct & {
  attributes: string[];
}
