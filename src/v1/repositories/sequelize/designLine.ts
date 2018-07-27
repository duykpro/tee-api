import { injectable, inject } from 'inversify';
import Sequelize from 'sequelize';
import { teeDB } from '../../storage/sequelize';
import { DesignLine } from '../../models';
import { DesignLineRepository } from '..';
import { ArtworkRepository } from '../artwork';
import { type } from '../../constants/serviceIdentifier';

interface DesignLineAttributes {
  id: number;
  metadata: {
    sides?: {
      [key: string]: {
        artwork_id: number;
        details: {
          dpi: number;
          widthInch: number;
          heightInch: number;
        };
        position: {
          x: number;
          y: number;
        };
      };
    };
  };
  created_at: Date;
  updated_at: Date;
}

interface DesignLineInstance extends Sequelize.Instance<DesignLineAttributes>, DesignLineAttributes { }

const SequelizeDesignLine = teeDB.define<DesignLineInstance, DesignLineAttributes>('designLine', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  metadata: {
    type: Sequelize.JSON
  }
}, {
  tableName: 'design_lines',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

@injectable()
export class SequelizeDesignLineRepository implements DesignLineRepository {

  constructor(
    @inject(type.ArtworkRepository) private artworkRepository: ArtworkRepository
  ) { }

  public async findById(id: string): Promise<DesignLine> {
    return this.instanceToModel(await SequelizeDesignLine.findById(id));
  }

  private async instanceToModel(instance: DesignLineInstance): Promise<DesignLine> {
    if (instance === null) {
      return null;
    }

    let designLine = <DesignLine>{
      id: instance.id.toString(),
      createdAt: instance.created_at,
      updatedAt: instance.updated_at
    };

    if (instance.metadata.sides) {
      let sides = {};

      await Promise.all(Object.keys(instance.metadata.sides).map(async (key) => {
        const artwork = await this.artworkRepository.findById(instance.metadata.sides[key].artwork_id.toString());
        delete instance.metadata.sides[key].artwork_id;
        sides[key] = instance.metadata.sides[key];
        sides[key].artwork = artwork;
      }));

      designLine.sides = sides;
    }

    return designLine;
  }
}
