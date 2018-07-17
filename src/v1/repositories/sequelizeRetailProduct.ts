import { injectable } from 'inversify';
import { Op } from 'sequelize';
import { flatten } from 'lodash';
import camelCase from 'camelcase';
import { RetailProduct, RetailProductVariant, RetailProductImage } from '../models';
import { RetailProductRepository, RetailProductListParams } from './retailProduct';
import {
  RetailProduct as SequelizeRetailProduct,
  RetailProductInstance,
  RetailProductMedia
} from '../storage/sequelize/models';

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

    const products = await SequelizeRetailProduct.findAll({
        where: where
      }).map(async (product: any) => {
        return await this.getAssociated(
          <RetailProduct>this.instanceToModel(product)
        );;
      });

    return products;
  }

  public async findById(id: string): Promise<RetailProduct> {
    const product = await this.getAssociated(
      <RetailProduct>this.instanceToModel(
        await SequelizeRetailProduct.findById(id)
      )
    );

    return product;
  }

  private async getAssociated(product: RetailProduct): Promise<RetailProduct> {
    // Get variants
    product.variants = await this.getVariants(product);
    product.images = await this.getImages(product);

    return product;
  }

  private async getVariants(product: RetailProduct): Promise<RetailProductVariant[]> {
    const variants = await SequelizeRetailProduct.findAll({
        where: {
          parentId: +product.id
        }
      }).map((variant: any) => {
        return <RetailProductVariant>this.instanceToModel(variant);
      });

    return variants;
  }

  private async getImages(product: RetailProduct): Promise<RetailProductImage[]> {
    const media = await RetailProductMedia.findAll({
        where: {
          id: {
            [Op.in]: product.images
          }
        }
      }).map((m: any, i) => {
        return <RetailProductImage>{
          id: m.id,
          src: `https://usercontent.amcdn.net/${m.path}`,
          position: i + 1
        };
      });

    return media;
  }

  private instanceToModel(source: RetailProductInstance): RetailProduct | RetailProductVariant {
    let product = <RetailProduct | RetailProductVariant>{};
    let data = Object.assign({}, source.get(), source.get('metadata'));
    data.attributes = data.attrs;
    delete data.attrs;
    delete data.metadata;

    Object.keys(data).forEach(key => {
      product[camelCase(key)] = data[key];
    });

    return product;
  }
}
