import { injectable } from 'inversify';
import Sequelize from 'sequelize';
import { storeDB } from '../../storage/sequelize';
import { Taxonomy } from '../../models';
import { TaxonomyRepository } from '..';

interface TaxonomyAttributes {
  id: number;
  parent_id: number;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

interface TaxonomyInstance extends Sequelize.Instance<TaxonomyAttributes>, TaxonomyAttributes { }

const SequelizeTaxonomy = storeDB.define<TaxonomyInstance, TaxonomyAttributes>('taxonomy', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  parent_id: {
    type: Sequelize.BIGINT
  },
  name: {
    type: Sequelize.STRING
  },
  slug: {
    type: Sequelize.STRING
  }
}, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

@injectable()
export class SequelizeTaxonomyRepository implements TaxonomyRepository {

  public async findBySlug(slug: string): Promise<Taxonomy> {
    return this.instanceToModel(await SequelizeTaxonomy.find({ where: { slug: slug } }));
  }

  private async instanceToModel(instance: TaxonomyInstance): Promise<Taxonomy> {
    if (instance === null) {
      return null;
    }

    let taxonomy: Taxonomy = {
      id: instance.id.toString(),
      name: instance.name,
      slug: instance.slug,
      createdAt: instance.created_at,
      updatedAt: instance.updated_at
    };

    return taxonomy;
  }
}
