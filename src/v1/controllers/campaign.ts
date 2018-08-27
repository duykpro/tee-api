import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';

import { type } from '../constants/serviceIdentifier';
import { Kind } from '../constants/response';
import { Domain, Code, Reason, SourceType } from '../constants/error';
import { Campaign } from '../models';
import { CampaignRepository, CampaignListParams } from '../repositories';
import { ItemResponse, ListItemResponse, ErrorResponse } from '../responses';

@injectable()
export class CampaignController {
  constructor(
    @inject(type.CampaignRepository) private campaign: CampaignRepository
  ) { }

  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Params
      let params: CampaignListParams = { filter: {} };
      let ids = req.query.ids;

      if (typeof ids === 'string') {
        ids = ids.split(',');
      }

      if (ids) {
        params.filter.ids = ids;
      }

      // Data
      const campaigns: Campaign[] = await this.campaign.list(params);
      const response = new ListItemResponse<Campaign>(
        'campaigns', Kind.Campaign, campaigns
      );

      res.status(200).send(response);
    } catch (e) {
      next(e);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.params.campaignSlug;
      const campaign = await this.campaign.findBySlug(slug);

      if (campaign === null) {
        throw new ErrorResponse({
          domain: Domain.Campaign,
          code: Code.NotFound,
          reason: Reason.CampaignNotFound,
          message: 'The campaign identified with the requests campaignSlug parameter cannot be found.',
          sourceType: SourceType.Parameter,
          source: 'campaignSlug'
        });
      }

      const response = new ItemResponse<Campaign>(Kind.Campaign, campaign);

      res.status(200).send(response);
    } catch (e) {
      next(e);
    }
  }
}
