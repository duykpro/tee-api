import { ProductColor } from '../models';

export interface ProductColorRepository {
  findById(id: string): Promise<ProductColor>;
}
