import { ProductTemplate } from '../models';

export interface ProductTemplateRepository {
  findById(id: string): Promise<ProductTemplate>;
}
