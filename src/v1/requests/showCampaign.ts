import { injectable, inject } from 'inversify';
import { param, check, ValidationChain } from 'express-validator/check';

import { type } from '../constants/serviceIdentifier';
import { CampaignRepository } from '../repositories';

@injectable()
export class ShowCampaignRequest {
  constructor(
    @inject(type.CampaignRepository) private campaign: CampaignRepository
  ) { }

  public rules(): ValidationChain[] {
    return [
      param('campaignSlug').custom(async slug => {
        const campaign = await this.campaign.findBySlug(slug);

        if (campaign === null) {
          throw new Error('The campaign identified with the requests campaignSlug parameter cannot be found.');
        }
      })
    ];
  }
}
