import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';

import { type } from '../constants/serviceIdentifier';
import { RetailProductRepository } from '../repositories';
import { Domain, Code, Reason, SourceType } from '../constants/error';
import elasticsearch from '../services/elasticsearch';
import { RetailProduct } from '../models';
import { Kind } from '../constants/response';
import { ListItemResponse, ErrorResponse } from '../responses';

@injectable()
export class RetailProductController {
  constructor(
    @inject(type.RetailProductRepository) private retailProductRepository: RetailProductRepository
  ) { }

  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let query: any = {
        bool: {
          must: [
          ]
        }
      };

      let ids = req.query.ids;

      if (typeof ids === 'string') {
        ids = ids.split(',');
      }

      if (ids) {
        query['bool']['must'].push({
          ids: {
            values: ids
          }
        });
      }

      const q = req.query.q;

      if (q) {
        query['bool']['must'].push({
          match: {
            name: q
          }
        });
      }

      const categories = req.query.categories;

      if (categories && categories.length > 0) {
        query['bool']['must'].push({
          terms: {
            'taxonomies.category.keyword': categories
          }
        });
      }

      const departments = req.query.departments;

      if (departments && departments.length > 0) {
        query['bool']['must'].push({
          terms: {
            'taxonomies.department.keyword': departments
          }
        });
      }

      const productTypes = req.query.productTypes;

      if (productTypes && productTypes.length > 0) {
        query['bool']['must'].push({
          terms: {
            'taxonomies.product_type.keyword': productTypes
          }
        });
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

      const searchResponse = await elasticsearch.search({
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

      let retailProducts = [];

      if (searchResponse.hits.total > 0) {
        const retailProductIds = searchResponse.hits.hits.map(value => value._id);
        retailProducts = await this.retailProductRepository.list({ filter: { ids: retailProductIds } });
      }

      // Filters
      const filterDepartments = searchResponse.aggregations.departments.buckets.map(value => {
        return { department: value.key, count: value.doc_count };
      });
      const filterProductTypes = searchResponse.aggregations.productTypes.buckets.map(value => {
        return { productType: value.key, count: value.doc_count };
      });
      const filterColors = searchResponse.aggregations.colors.buckets.map(value => {
        return { color: value.key, count: value.doc_count };
      });
      const filterPriceRanges = searchResponse.aggregations.priceRanges.buckets.map(value => {
        return {
          name: value.key,
          from: value.from,
          to: value.to,
          count: value.doc_count
        };
      });

      const meta = {
        count: searchResponse.hits.total,
        filters: {
          filterProductTypes,
          filterDepartments,
          filterColors,
          filterPriceRanges
        }
      };
      const response = new ListItemResponse<RetailProduct>(
        'retailProducts', Kind.RetailProduct, retailProducts, meta
      );

      res.status(200).send(response);
    } catch (e) {
      next(e);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.retailProductId;
      const retailProduct = await this.retailProductRepository.findById(id);

      if (retailProduct === null) {
        throw new ErrorResponse({
          domain: Domain.RetailProduct,
          code: Code.NotFound,
          reason: Reason.RetailProductNotFound,
          message: 'The retail product identified with the requests retailProductId parameter cannot be found.',
          sourceType: SourceType.Parameter,
          source: 'retailProductId'
        });
      }

      res.status(200).send(retailProduct);
    } catch (e) {
      next(e);
    }
  }

}
