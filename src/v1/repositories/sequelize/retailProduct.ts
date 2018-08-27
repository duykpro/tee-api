import { injectable } from 'inversify';
import Sequelize, { Op } from 'sequelize';
import { keyBy } from 'lodash';

import {
  RetailProduct,
  RetailProductVariant,
  RetailProductType,
  RetailProductStatus
} from '../../models';
import {
  RetailProductListParams,
  RetailProductRepository,
  RetailProductStatus as Status,
  RetailProductType as Type
} from '../retailProduct';
import { storeDB } from '../../storage/sequelize';

export interface RetailProductAttributes {
  id: number;
  parentId: number;
  name: string;
  metadata: {
    sku?: string;
    linked_product_ids?: number[];
    images?: {
      id: number;
      featured?: boolean;
      position: number;
      variantIds: number[];
    }[];
    price?: number;
    regular_price?: number;
    sale_price?: number;
    is_virtual?: boolean;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    related_ids?: number[];
  };
  attrs: {
    id: string;
    name: string;
    default: string;
    options: string[];
    position: number;
  }[] | string[];
  custom_metadata?: {
    [k: string]: {
      [k: string]: string;
    };
  };
  type: Type;
  status: Status;
  created_at: Date;
  updated_at: Date;
}

export interface RetailProductMediaAttributes {
  id: number;
  path: string;
  metadata: {
    size?: number;
    minetype?: string;
  };
  custom_metadata?: {
    [k: string]: {
      [k: string]: string;
    };
  };
  uploadedBy: number;
  created_at: Date;
  updated_at: Date;
}

export interface RetailProductInstance extends Sequelize.Instance<RetailProductAttributes>, RetailProductAttributes {
}

export interface RetailProductMediaInstance extends Sequelize.Instance<RetailProductMediaAttributes>, RetailProductMediaAttributes {
}

export const sequelizeRetailProduct = storeDB.define<RetailProductInstance, RetailProductAttributes>('retailProduct', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  parentId: {
    type: Sequelize.BIGINT,
    field: 'parent_id'
  },
  name: {
    type: Sequelize.STRING
  },
  metadata: {
    type: Sequelize.JSON
  },
  // Attribute named `attributes` bug #4610
  // https://github.com/sequelize/sequelize/issues/4610
  attrs: {
    type: Sequelize.JSON,
    field: 'attributes'
  },
  custom_metadata: {
    type: Sequelize.JSON
  },
  type: {
    type: Sequelize.TINYINT
  },
  status: {
    type: Sequelize.TINYINT
  }
}, {
  tableName: 'products',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export const sequelizeRetailProductMedia = storeDB.define<RetailProductMediaInstance, RetailProductMediaAttributes>('retailProductMedia', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  path: {
    type: Sequelize.STRING
  },
  metadata: {
    type: Sequelize.JSON
  },
  custom_metadata: {
    type: Sequelize.JSON
  },
  uploadedBy: {
    type: Sequelize.BIGINT,
    field: 'uploaded_by'
  }
}, {
  tableName: 'media',
  createdAt: 'uploaded_at',
  updatedAt: 'updated_at'
});

const typeTexts = {
  [Type.SingleProduct]: 'single',
  [Type.VariableProduct]: 'variable'
};

const statusTexts = {
  [Status.Published]: 'published'
};

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

    return await sequelizeRetailProduct.findAll({
        where: where
      }).map(async instance => {
        return this.instanceToModel<RetailProduct>(instance);
      });
  }

  public async findById(id: string): Promise<RetailProduct> {
    return this.instanceToModel<RetailProduct>(await sequelizeRetailProduct.findById(id));
  }

  private async instanceToModel<T extends RetailProduct | RetailProductVariant>(instance: RetailProductInstance): Promise<T> {
    if (instance === null) {
      return null;
    }

    let product = {
      id: instance.id.toString(),
      name: instance.name,
      sku: instance.metadata.sku,
      price: instance.metadata.price,
      regularPrice: instance.metadata.regular_price,
      salePrice: instance.metadata.sale_price,
      weight: instance.metadata.weight,
      dimensions: instance.metadata.dimensions,
      attributes: instance.attrs,
      metadata: instance.custom_metadata,
      createdAt: instance.created_at,
      updatedAt: instance.updated_at
    } as T;

    if (instance.metadata.images) {
      const ids = instance.metadata.images.map(image => image.id);
      const featured = instance.metadata.images.find(image => image.featured);
      const media = keyBy(
        await sequelizeRetailProductMedia.findAll({
          where: {
            id: {
              [Op.in]: ids
            }
          }
        }),
        'id'
      );
      (<RetailProduct>product).images = instance.metadata.images.map(image => {
        return {
          id: image.id.toString(),
          src: `https://cloud.printabel.com/${media[image.id].path}`,
          position: image.position,
          metadata: media[image.id].custom_metadata,
          variantIds: image.variantIds ? image.variantIds.map(id => id.toString()) : undefined
        };
      });
      (<RetailProduct>product).featuredImage = (<RetailProduct>product).images[0];
      (<RetailProduct>product).images.forEach(i => {
        if (featured && i.id == featured.id.toString()) {
          (<RetailProduct>product).featuredImage = i;
        }
      });
    }

    if (instance.type == Type.VariableProduct) {
      (<RetailProduct>product).variants = await sequelizeRetailProduct.findAll({
          where: {
            parentId: instance.id
          }
        }).map(async i => {
          return this.instanceToModel<RetailProductVariant>(i);
        });
      (<RetailProduct>product).type = typeTexts[instance.type] as RetailProductType;
      (<RetailProduct>product).status = statusTexts[instance.status] as RetailProductStatus;

      if (instance.metadata.related_ids) {
        (<RetailProduct>product).relatedIds = instance.metadata.related_ids.map(id => id.toString());
      }
    }

    return product;
  }
}
