import { injectable } from 'inversify';
import Sequelize from 'sequelize';
import { ProductMockup } from '../../models';
import { ProductMockupRepository } from '..';
import { teeDB } from '../../storage/sequelize';

interface ProductMockupAttributes {
  id: number;
  product_id: number;
  name: string;
  description: string;
  side: string;
  image: string;
  dimensions: {
    width: number;
    height: number;
  };
  printable: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  pixel_to_inch_ratio: number;
  can_use_for_design: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ProductMockupInstance extends Sequelize.Instance<ProductMockupAttributes>, ProductMockupAttributes { }

const SequelizeProductMockup = teeDB.define<ProductMockupInstance, ProductMockupAttributes>('productMockup', {
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
  description: {
    type: Sequelize.TEXT
  },
  side: {
    type: Sequelize.STRING
  },
  image: {
    type: Sequelize.STRING
  },
  dimensions: {
    type: Sequelize.JSON
  },
  printable: {
    type: Sequelize.JSON
  },
  pixel_to_inch_ratio: {
    type: Sequelize.DOUBLE
  },
  can_use_for_design: {
    type: Sequelize.BOOLEAN
  }
}, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});


@injectable()
export class SequelizeProductMockupRepository implements ProductMockupRepository {

  public async findById(id: string): Promise<ProductMockup> {
    return this.instanceToModel(await SequelizeProductMockup.findById(id));
  }

  private async instanceToModel(instance: ProductMockupInstance): Promise<ProductMockup> {
    const mockup: ProductMockup = {
      id: instance.id.toString(),
      name: instance.name,
      description: instance.description,
      side: instance.side,
      image: instance.image,
      dimensions: instance.dimensions,
      printable: instance.printable,
      ppi: instance.pixel_to_inch_ratio,
      canUseForDesign: instance.can_use_for_design,
      createdAt: instance.created_at,
      updatedAt: instance.updated_at
    };

    return mockup;
  }
}
