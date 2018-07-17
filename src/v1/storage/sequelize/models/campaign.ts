import Sequelize from 'sequelize';
import { teeDB } from '..';
import { Campaign as CampaignModel } from '../../../models';

export interface CampaignInstance extends Sequelize.Instance<CampaignModel>, CampaignModel { }

export const Campaign = teeDB.define<CampaignInstance, CampaignModel>('campaign', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    get() {
      return this.getDataValue('id').toString();
    }
  },
  title: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.TEXT
  }
}, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export const CampaignRetailProduct = teeDB.define('campaignRetailProduct', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  campaignId: {
    type: Sequelize.BIGINT,
    field: 'campaign_id'
  },
  retailProductId: {
    type: Sequelize.STRING,
    field: 'store_product_id'
  }
}, {
  timestamps: false,
  tableName: 'campaign_store_products'
});
