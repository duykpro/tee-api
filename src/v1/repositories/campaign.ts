import { Campaign } from '../models';

export interface CampaignRepository {
  list(): Promise<Campaign[]>;
  findById(id: string): Promise<Campaign>;
}
