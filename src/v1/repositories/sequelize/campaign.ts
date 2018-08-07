import { injectable, inject } from 'inversify';
import { type } from '../../constants/serviceIdentifier';
import { Campaign, RetailProduct } from '../../models';
import { CampaignRepository, CampaignListParams } from '..';
import { RetailProductRepository } from '../retailProduct';
import {
  Campaign as SequelizeCampaign,
  CampaignInstance
} from '../../storage/sequelize/models';
import { Op } from 'sequelize';
import { groupBy, flatten } from 'lodash';

@injectable()
export class SequelizeCampaignRepository implements CampaignRepository {
  constructor(
    @inject(type.RetailProductRepository) private retailProduct: RetailProductRepository
  ) { }

  public async list(params?: CampaignListParams): Promise<Campaign[]> {
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

    return await SequelizeCampaign.findAll({
        where: where
      }).map(async instance => {
        return this.instanceToModel(instance);
      });
  }

  public async findById(id: string): Promise<Campaign> {
    return this.instanceToModel(await SequelizeCampaign.findById(id));
  }

  public async findBySlug(slug: string): Promise<Campaign> {
    return this.instanceToModel(await SequelizeCampaign.find({ where: { slug: slug } }));
  }

  private async instanceToModel(instance: CampaignInstance): Promise<Campaign> {
    if (instance === null) {
      return null;
    }

    const retailProducts = await this.retailProduct.list({ filter: { ids: instance.metadata.retail_product_ids.map(id => id.toString()) } });

    let campaign: Campaign = {
      id: instance.id.toString(),
      title: instance.title,
      description: instance.description,
      slug: instance.slug,
      duration: instance.metadata.duration,
      retailProducts: retailProducts,
      createdAt: instance.created_at,
      updatedAt: instance.updated_at
    };

    return campaign;
  }
}
