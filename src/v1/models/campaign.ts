import { RetailProduct } from "./retailProduct";

export interface Campaign {
  id?: string;
  title?: string;
  description?: string;
  retailProducts?: RetailProduct[];
  createdAt?: Date;
  updatedAt?: Date;
}
