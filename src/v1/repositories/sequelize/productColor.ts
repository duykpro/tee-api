import { injectable } from 'inversify';
import Sequelize from 'sequelize';
import { teeDB } from '../../storage/sequelize';
import { ProductColor } from '../../models';
import { ProductColorRepository } from '..';

interface ProductColorAttributes {
  id: number;
  product_id: number;
  name: string;
  hex: string;
  sizes: any;
  cost: number;
  created_at: Date;
  updated_at: Date;
}

interface ProductColorInstance extends Sequelize.Instance<ProductColorAttributes>, ProductColorAttributes { }

const SequelizeProductColor = teeDB.define<ProductColorInstance, ProductColorAttributes>('productColor', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  product_id: {
    type: Sequelize.BIGINT
  },
  name: {
    type: Sequelize.STRING
  },
  hex: {
    type: Sequelize.STRING
  },
  sizes: {
    type: Sequelize.JSON
  },
  cost: {
    type: Sequelize.BIGINT
  }
}, {
  tableName: 'product_colors',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

@injectable()
export class SequelizeProductColorRepository implements ProductColorRepository {

  public async findById(id: string): Promise<ProductColor> {
    return this.instanceToModel(await SequelizeProductColor.findById(id));
  }

  private async instanceToModel(instance: ProductColorInstance): Promise<ProductColor> {
    if (instance === null) {
      return null;
    }

    let color: ProductColor = {
      id: instance.id.toString(),
      name: instance.name,
      hex: instance.hex,
      sizes: instance.sizes,
      cost: instance.cost,
      createdAt: instance.created_at,
      updatedAt: instance.updated_at
    };

    return color;
  }
}
