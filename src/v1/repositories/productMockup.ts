import { ProductMockup } from '../models';

export interface ProductMockupRepository {
  findById(id: string): Promise<ProductMockup>;
}
