import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { type } from '../constants/serviceIdentifier';
import { CampaignRepository } from '../repositories/campaign';
import { Campaign } from '../models/campaign';
import { ItemResponse, ListItemResponse } from '../responses';
import { APIError } from '../error';

@injectable()
export class CampaignController {
  constructor(
    @inject(type.CampaignRepository) private campaign: CampaignRepository
  ) { }

  public async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaigns: Campaign[] = await this.campaign.list();
      const response: ListItemResponse = {
        id: 'campaigns',
        data: campaigns
      };

      res.status(200).send(response);
    } catch (e) {
      next(e);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.campaignId;
      const campaign = await this.campaign.findById(id);

      if (campaign === null) {
        throw new APIError({
          domain: 'tee.cart',
          code: '404',
          reason: 'campaignNotFound',
          message: 'The campaign identified with the requests campaignId parameter cannot be found.',
          sourceType: 'parameter',
          source: 'campaignId'
        });
      }

      res.status(200).send(campaign);
    } catch (e) {
      next(e);
    }
  }
}
