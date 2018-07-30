import { Campaign } from '../models';

export interface CampaignListParams {
  filter?: {
    ids?: string[];
  }
}

export interface CampaignRepository {
  list(params?: CampaignListParams): Promise<Campaign[]>;
  findById(id: string): Promise<Campaign>;
  findBySlug(slug: string): Promise<Campaign>;
}
