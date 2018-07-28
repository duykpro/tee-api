import { Cart } from '../models';

export interface CartRepository {
  findById(id: string): Promise<Cart>;
  init(data?: any): Promise<Cart>;
  update(id: string, data: any): Promise<Cart>;
  delete(id: string): Promise<boolean>;
}
