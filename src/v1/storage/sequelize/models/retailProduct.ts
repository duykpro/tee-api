import Sequelize from 'sequelize';
import { storeDB } from '..';
import { RetailProduct as RetailProductModel } from '../../../models';

export interface RetailProductAttributes {
  id: number;
  parentId: number | null;
  name: string;
  metadata: {
    sku?: string;
    linked_product_ids?: number[];
    images?: {
      id: number;
      featured?: boolean;
    }[];
  };
  attrs: {
    id: string;
    name: string;
    type: string;
    default: string;
    options: {
      cost?: number;
      label?: string;
      value?: string;
    }[];
  }[] | {
    id: string;
    value: string;
  }[];
  type: number;
  status: number;
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
  uploadedBy: number;
  created_at: Date;
  updated_at: Date;
}

export interface RetailProductInstance extends Sequelize.Instance<RetailProductAttributes>, RetailProductAttributes {
}

export interface RetailProductMediaInstance extends Sequelize.Instance<RetailProductMediaAttributes>, RetailProductMediaAttributes {
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

export const RetailProductMedia = storeDB.define<RetailProductMediaInstance, RetailProductMediaAttributes>('retailProductMedia', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  path: {
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
