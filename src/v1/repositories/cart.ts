import { Cart } from '../models';

export interface CartRepository {
  findById(id: string): Promise<Cart>;
  init(data?: Cart): Promise<Cart>;
  create(): Promise<Cart>;
  update(cart: Cart): Promise<boolean>;
}
