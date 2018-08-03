import { RetailProduct } from './retailProduct';

export type Campaign = {
  id: string;
  title: string;
  description: string;
  slug: string;
  duration: Number;
  retailProducts: RetailProduct[];
  createdAt: Date;
  updatedAt: Date;
}
