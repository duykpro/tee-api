import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { type } from '../constants/serviceIdentifier';
import { CampaignRepository } from '../repositories/campaign';
import { Campaign } from '../models/campaign';
import { ItemResponse, ListItemResponse } from '../responses';
import { APIError } from '../error';
import { TaxonomyRepository } from '../repositories';
import { domain, code, reason, sourceType } from '../constants/error';
import { teeDB } from '../storage/sequelize';
import elasticsearch from '../services/elasticsearch';

@injectable()
export class SearchController {
  constructor(
    @inject(type.TaxonomyRepository) private taxonomyRepository: TaxonomyRepository,
    @inject(type.CampaignRepository) private campaignRepository: CampaignRepository
  ) { }

  public async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let query = {};
      const q = req.query.q;

      if (q) {
        query['match'] = {
          name: q
        }
      }

      if (Object.keys(query).length <= 0) {
        query = undefined;
      }

      const from = !isNaN(+req.query.offset) ? +req.query.offset : 0;
      const size = !isNaN(+req.query.limit) ? +req.query.limit : 50;
      const sort = { price: { order: 'asc' } };
      const aggs = {
        tags : {
          terms : {
            field: 'tags',
            order: {
              _count: 'desc'
            }
          }
        },
        colors : {
          terms : {
            field: 'colors.keyword',
            order: {
              _count: 'desc'
            }
          }
        },
        priceRanges: {
          range: {
            field: 'price',
            ranges: [
              { to: 100.0, key: '0 - 100' },
              { from: 100.0, to: 200.0, key: '100 - 200' },
              { from: 200.0, to: 300.0, key: '200 - 300' },
              { from: 300.0, key: '> 300' }
            ]
          }
        }
      };

      const response = await elasticsearch.search({
        index: 'printabel',
        type: 'retail_product',
        body: {
          query,
          from,
          size,
          sort,
          aggs
        }
      });

      const campaignIds = response.hits.hits.map(value => value._id);
      const campaigns = await this.campaignRepository.list({ filter: { ids: campaignIds } });
      const colors = response.aggregations.colors.buckets.map(value => {
        return { color: value.key, count: value.doc_count };
      });
      const tags = response.aggregations.tags.buckets.map(value => {
        return { tag: value.key, count: value.doc_count };
      });
      const priceRanges = response.aggregations.priceRanges.buckets.map(value => {
        return {
          name: value.key,
          from: value.from,
          to: value.to,
          count: value.doc_count
        };
      });

      res.status(200).send({
        data: campaigns,
        meta: {
          count: response.hits.total,
          filters: {
            colors,
            tags,
            priceRanges
          }
        }
      });
    } catch (e) {
      next(e);
    }
  }
}
