import Sequelize from 'sequelize';
import { teeDB } from '..';
import { Campaign as CampaignModel } from '../../../models';

export interface CampaignAttributes {
  id: number;
  title: string;
  description: string;
  slug: string;
  metadata: {
    duration: number;
    products: {
      product_id: number;
      design_line_id: number;
      color_ids: number[];
      template_ids: number[];
      price: number;
    }[];
    default: {
      product_id: number;
      color_id: number;
      template_id: number;
    };
    retail_product_id: number;
  };
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface CampaignInstance extends Sequelize.Instance<CampaignAttributes>, CampaignAttributes { }

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
  },
  slug: {
    type: Sequelize.TEXT
  },
  metadata: {
    type: Sequelize.JSON
  },
  status: {
    type: Sequelize.TINYINT
  }
}, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
