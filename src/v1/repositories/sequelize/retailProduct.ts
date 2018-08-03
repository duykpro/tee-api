import { injectable, MetadataReader } from 'inversify';
import { Op } from 'sequelize';
import { flatten } from 'lodash';
import camelCase from 'camelcase';
import { RetailProduct, RetailProductVariant, RetailProductImage } from '../../models';
import { RetailProductRepository, RetailProductListParams, Type } from '../retailProduct';
import {
  RetailProduct as SequelizeRetailProduct,
  RetailProductInstance,
  RetailProductMedia
} from '../../storage/sequelize/models';

@injectable()
export class SequelizeRetailProductRepository implements RetailProductRepository {
  public async list(params?: RetailProductListParams): Promise<RetailProduct[]> {
    let where = {};

    if (params) {
      if (params.filter) {
        if (params.filter.ids && params.filter.ids.length > 0) {
          where['id'] = {
            [Op.in]: params.filter.ids
          }
        }
      }
    }

    return await SequelizeRetailProduct.findAll({
        where: where
      }).map(async instance => {
        return this.instanceToModel<RetailProduct>(instance, true);
      });
  }

  public async findById(id: string): Promise<RetailProduct> {
    return this.instanceToModel<RetailProduct>(await SequelizeRetailProduct.findById(id), true);
  }

  private async instanceToModel<T extends RetailProduct | RetailProductVariant>(instance: RetailProductInstance, loadRelationship: boolean = false): Promise<T> {
    if (instance === null) {
      return null;
    }

    let product = <T>{
      id: instance.id.toString(),
      name: instance.name,
      sku: instance.metadata.sku,
      price: instance.metadata.price,
      regularPrice: instance.metadata.regular_price,
      salePrice: instance.metadata.sale_price,
      weight: instance.metadata.weight,
      dimensions: instance.metadata.dimensions,
      createdAt: instance.created_at,
      updatedAt: instance.updated_at,
      attributes: instance.attrs,
      metadata: instance.metadata
    };

    if (loadRelationship) {
      if (instance.type == Type.GroupedProduct && instance.metadata.linked_product_ids) {
        const ids = instance.metadata.linked_product_ids.map(id => id.toString());
        (<RetailProduct>product).linkedProducts = await this.list({ filter: { ids } });
        (<RetailProduct>product).linkedProducts.sort((a, b) => {
          return instance.metadata.linked_product_ids.indexOf(+a.id) - instance.metadata.linked_product_ids.indexOf(+b.id);
        });
      }

      if (instance.type == Type.VariableProduct) {
        (<RetailProduct>product).variants = await SequelizeRetailProduct.findAll({
            where: {
              parentId: instance.id
            }
          }).map(async i => {
            return this.instanceToModel<RetailProductVariant>(i);
          });
      }

      if (instance.metadata.related_ids) {
        (<RetailProduct>product).related = await SequelizeRetailProduct.findAll({
            where: {
              id: {
                [Op.in]: instance.metadata.related_ids
              }
            }
          }).map(async i => {
            return this.instanceToModel<RetailProduct>(i);
          });
      }
    }

    if (instance.metadata.images) {
      const ids = instance.metadata.images.map(image => image.id);
      const featured = instance.metadata.images.find(image => image.featured);
      const images = await RetailProductMedia.findAll({
          where: {
            id: {
              [Op.in]: ids
            }
          }
        }).map(async (m, i) => {
          return {
            id: m.id.toString(),
            src: `https://cloud.printabel.com/${m.path}`,
            position: i + 1
          };
        });
      product.images = images;

      if (instance.type != Type.ProductVariation) {
        product.images.forEach(i => {
          if (i.id == featured.id.toString()) {
            (<RetailProduct>product).featuredImage = i;
          }
        });
      }
    }

    return product;
  }
}
