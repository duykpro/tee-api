import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { type } from '../constants/serviceIdentifier';
import { CampaignRepository } from '../repositories/campaign';
import { Campaign } from '../models/campaign';
import { ItemResponse, ListItemResponse } from '../responses';
import { APIError } from '../error';
import { TaxonomyRepository, RetailProductRepository } from '../repositories';
import { domain, code, reason, sourceType } from '../constants/error';
import { teeDB } from '../storage/sequelize';
import elasticsearch from '../services/elasticsearch';

@injectable()
export class SearchController {
  constructor(
    @inject(type.TaxonomyRepository) private taxonomyRepository: TaxonomyRepository,
    @inject(type.CampaignRepository) private campaignRepository: CampaignRepository,
    @inject(type.RetailProductRepository) private retailProductRepository: RetailProductRepository
  ) { }

  public async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let query: any = {
        bool: {
          must: [
            { term: { type: '3' } }
          ]
        }
      };
      const q = req.query.q;

      if (q) {
        query['bool']['must'].push({
          match: {
            name: q
          }
        });
      }

      if (Object.keys(query).length <= 0) {
        query = undefined;
      }

      const from = !isNaN(+req.query.offset) ? +req.query.offset : 0;
      const size = !isNaN(+req.query.limit) ? +req.query.limit : 50;
      const sort = { price: { order: 'asc' } };
      const aggs = {
        productTypes: {
          terms: {
            field: 'taxonomies.product_type.keyword',
            order: {
              _count: 'desc'
            }
          }
        },
        departments: {
          terms: {
            field: 'taxonomies.department.keyword',
            order: {
              _count: 'desc'
            }
          }
        },
        colors: {
          terms: {
            field: 'attributes.Color.keyword',
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

      const retailProductIds = response.hits.hits.map(value => value._id);
      const retailProducts = await this.retailProductRepository.list({ filter: { ids: retailProductIds } });
      const departments = response.aggregations.departments.buckets.map(value => {
        return { department: value.key, count: value.doc_count };
      });
      const productTypes = response.aggregations.productTypes.buckets.map(value => {
        return { productType: value.key, count: value.doc_count };
      });
      const colors = response.aggregations.colors.buckets.map(value => {
        return { color: value.key, count: value.doc_count };
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
        data: retailProducts,
        meta: {
          count: response.hits.total,
          filters: {
            productTypes,
            departments,
            colors,
            priceRanges
          }
        }
      });
    } catch (e) {
      next(e);
    }
  }
}
