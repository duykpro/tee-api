import { injectable, inject } from 'inversify';
import { Op } from 'sequelize';
import { type } from '../constants/serviceIdentifier';
import { Campaign, RetailProduct } from '../models';
import { CampaignRepository } from './campaign';
import { RetailProductRepository } from './retailProduct';
import camelCase from 'camelcase';
import {
  Campaign as SequelizeCampaign,
  CampaignInstance,
  CampaignRetailProduct,
  RetailProduct as SequelizeRetailProduct
} from '../storage/sequelize/models';

@injectable()
export class SequelizeCampaignRepository implements CampaignRepository {
  constructor(
    @inject(type.RetailProductRepository) private retailProduct: RetailProductRepository
  ) { }

  public async list(): Promise<Campaign[]> {
    const campaigns = await SequelizeCampaign.findAll().map((campaign: any) => {
      return this.instanceToModel(campaign);
    })

    return campaigns;
  }

  public async findById(id: string): Promise<Campaign> {
    let campaign = this.instanceToModel(await SequelizeCampaign.findById(id));
    campaign = await this.getAssociated(campaign);

    return campaign;
  }

  private instanceToModel(source: CampaignInstance): Campaign {
    let campaign = <Campaign>{};

    Object.keys(source.get()).forEach(key => {
      campaign[camelCase(key)] = source[key];
    });

    return campaign;
  }

  private async getAssociated(campaign: Campaign): Promise<Campaign> {
    campaign.retailProducts = await this.getAssociatedRetailProducts(campaign);

    return campaign;
  }

  private async getAssociatedRetailProducts(campaign: Campaign): Promise<RetailProduct[]> {
    const campaignRetailProducts = await CampaignRetailProduct.findAll({
      where: {
        campaignId: campaign.id
      }
    });
    const retailProductIds = campaignRetailProducts.map((product: any) => product.retailProductId);
    const retailProducts = await this.retailProduct.list({
      filter: {
        ids: retailProductIds
      }
    });

    return retailProducts as RetailProduct[];
  }
}
