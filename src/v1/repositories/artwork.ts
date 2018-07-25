import { Artwork } from '../models';

export interface ArtworkRepository {
  findById(id: string): Promise<Artwork>;
}
