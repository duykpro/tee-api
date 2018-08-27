import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { type } from '../constants/serviceIdentifier';
import { CampaignRepository } from '../repositories/campaign';
import { Campaign } from '../models/campaign';
import { ItemResponse, ListItemResponse, ErrorResponse } from '../responses';
import { TaxonomyRepository } from '../repositories';
import { Domain, Code, Reason, SourceType } from '../constants/error';
import { teeDB } from '../storage/sequelize';

@injectable()
export class TaxonomyController {
  constructor(
    @inject(type.TaxonomyRepository) private taxonomyRepository: TaxonomyRepository,
    @inject(type.CampaignRepository) private campaignRepository: CampaignRepository
  ) { }

  public async listCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.params.taxonomySlug;
      const taxonomy = await this.taxonomyRepository.findBySlug(slug);

      if (taxonomy === null) {
        throw new ErrorResponse({
          domain: Domain.Taxonomy,
          code: Code.NotFound,
          reason: Reason.TaxonomyNotFound,
          message: 'Cart not found.',
          sourceType: SourceType.Parameter,
          source: 'cartId'
        });
      }

      let rows = await teeDB.query('SELECT `campaign_id` FROM `campaign_taxonomy` WHERE `taxonomy_id` = ?', { replacements: [+taxonomy.id], type: teeDB.QueryTypes.SELECT });
      const campaignIds = rows.map(r => r.campaign_id);
      const campaigns = await this.campaignRepository.list({ filter: { ids: campaignIds } });

      res.status(200).send(campaigns);
    } catch (e) {
      next(e);
    }
  }
}
