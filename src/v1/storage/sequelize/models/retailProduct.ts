import Sequelize from 'sequelize';
import { storeDB } from '..';
import { RetailProduct as RetailProductModel } from '../../../models';

export interface RetailProductAttributes {
  id: number;
  parentId: number | null;
  name: string;
  metadata: Object;
  attrs: Object;
}

export interface RetailProductInstance extends Sequelize.Instance<RetailProductAttributes>, RetailProductAttributes {
}

export const RetailProductAttribute = storeDB.define('retailProductAttribute', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: Sequelize.STRING
  },
  name: {
    type: Sequelize.STRING
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: Sequelize.DATE,
    field: 'updated_at'
  },
  deletedAt: {
    type: Sequelize.DATE,
    field: 'deleted_at'
  }
}, {
  paranoid: true,
  tableName: 'attributes'
});

export const RetailProductAttributeValue = storeDB.define('retailProductAttributeValue', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  attributeId: {
    type: Sequelize.BIGINT,
    field: 'attribute_id'
  },
  value: {
    type: Sequelize.TEXT
  }
}, {
  timestamps: false,
  tableName: 'attribute_values'
});

export const RetailProduct = storeDB.define<RetailProductInstance, RetailProductAttributes>('retailProduct', {
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
  }
}, {
  tableName: 'products',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export const RetailProductMedia = storeDB.define('retailProductMedia', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  path: {
    type: Sequelize.STRING
  },
  minetype: {
    type: Sequelize.STRING
  },
  size: {
    type: Sequelize.STRING
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

export const RetailProductProductAttributeValue = storeDB.define('retailProductProductAttributeValue', {
}, {
  timestamps: false,
  tableName: 'product_attribute_value'
});

// RetailProductAttributeValue.belongsTo(RetailProductAttribute, { foreignKey: 'attribute_id' });
// RetailProductAttribute.hasMany(RetailProductAttributeValue, { foreignKey: 'attribute_id' });
// RetailProduct.belongsToMany(RetailProductAttributeValue, {
//   as: 'Attributes',
//   through: RetailProductProductAttributeValue,
//   foreignKey: 'product_id',
//   otherKey: 'attribute_value_id'
// });
// RetailProductAttributeValue.belongsToMany(RetailProduct, {
//   as: 'Products',
//   through: RetailProductProductAttributeValue,
//   foreignKey: 'attribute_value_id',
//   otherKey: 'product_id'
// });
