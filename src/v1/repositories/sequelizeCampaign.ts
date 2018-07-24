import { injectable, inject } from 'inversify';
import { Op } from 'sequelize';
import { pick } from 'lodash';
import { type } from '../constants/serviceIdentifier';
import { Campaign, RetailProduct } from '../models';
import { CampaignRepository } from './campaign';
import { RetailProductRepository } from './retailProduct';
import camelCase from 'camelcase';
import {
  Campaign as SequelizeCampaign,
  CampaignInstance,
  RetailProduct as SequelizeRetailProduct
} from '../storage/sequelize/models';

@injectable()
export class SequelizeCampaignRepository implements CampaignRepository {
  constructor(
    @inject(type.RetailProductRepository) private retailProduct: RetailProductRepository
  ) { }

  public async list(): Promise<Campaign[]> {
    return await SequelizeCampaign.findAll().map(async instance => {
      return this.instanceToModel(instance);
    });
  }

  public async findById(id: string): Promise<Campaign> {
    return this.instanceToModel(await SequelizeCampaign.findById(id));
  }

  private async instanceToModel(instance: CampaignInstance): Promise<Campaign> {
    const campaign: Campaign = {
      id: instance.id.toString(),
      title: instance.title,
      description: instance.description,
      slug: instance.slug,
      duration: instance.metadata.duration,
      retailProduct: await this.retailProduct.findById(''+instance.metadata.retail_product_id),
      createdAt: instance.created_at,
      updatedAt: instance.updated_at
    };

    return campaign;
  }
}
