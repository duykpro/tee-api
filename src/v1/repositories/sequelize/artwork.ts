import { injectable } from 'inversify';
import Sequelize from 'sequelize';
import { teeDB } from '../../storage/sequelize';
import { Artwork } from '../../models';
import { ArtworkRepository } from '..';

interface ArtworkAttributes {
  id: string;
  path: string;
  metadata: {
    size?: number;
    minetype?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  uploaded_at: Date;
  updated_at: Date;
}

interface ArtworkInstance extends Sequelize.Instance<ArtworkAttributes>, ArtworkAttributes { }

const SequelizeArtwork = teeDB.define<ArtworkInstance, ArtworkAttributes>('productColor', {
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
  }
}, {
  createdAt: 'uploaded_at',
  updatedAt: 'updated_at'
});

@injectable()
export class SequelizeArtworkRepository implements ArtworkRepository {

  public async findById(id: string): Promise<Artwork> {
    return this.instanceToModel(await SequelizeArtwork.findById(id));
  }

  private async instanceToModel(instance: ArtworkInstance): Promise<Artwork> {
    const artwork: Artwork = {
      id: instance.id.toString(),
      path: instance.path,
      uploadedAt: instance.uploaded_at,
      updatedAt: instance.updated_at
    };

    return artwork;
  }
}
