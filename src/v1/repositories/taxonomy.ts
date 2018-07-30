import { Taxonomy } from '../models';

export interface TaxonomyRepository {
  findBySlug(slug: string): Promise<Taxonomy>;
}
