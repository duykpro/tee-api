import { injectable } from 'inversify';
import Sequelize from 'sequelize';
import { ProductTemplate } from '../../models';
import { ProductTemplateRepository } from '..';
import { teeDB } from '../../storage/sequelize';

interface ProductTemplateAttributes {
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

interface ProductTemplateInstance extends Sequelize.Instance<ProductTemplateAttributes>, ProductTemplateAttributes { }

const SequelizeProductTemplate = teeDB.define<ProductTemplateInstance, ProductTemplateAttributes>('productTemplate', {
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
  tableName: 'product_templates',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});


@injectable()
export class SequelizeProductTemplateRepository implements ProductTemplateRepository {

  public async findById(id: string): Promise<ProductTemplate> {
    return this.instanceToModel(await SequelizeProductTemplate.findById(id));
  }

  private async instanceToModel(instance: ProductTemplateInstance): Promise<ProductTemplate> {
    if (instance === null) {
      return null;
    }

    const template: ProductTemplate = {
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

    return template;
  }
}
