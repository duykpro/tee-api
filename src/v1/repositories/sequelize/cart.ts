import { injectable, inject } from 'inversify';
import Sequelize from 'sequelize';
import { v4 } from 'uuid';
import { keyBy, omit, get, values, sum, sumBy } from 'lodash';

import { type } from '../../constants/serviceIdentifier';
import { CartRepository, RetailProductRepository } from '..';
import { storeDB } from '../../storage/sequelize';
import { Cart, CartInvoice, CartItem } from '../../models';

interface CartAttributes {
  id: string;
  metadata: {
    invoice?: {
      discounts: number;
      fees: number;
      shipping: number;
      subtotal: number;
      tax: number;
      total: number;
    };
  };
  items: {
    id: string;
    quantity: number;
    meta: {
      campaignId: string;
    };
  }[];
  created_at?: Date;
  updated_at?: Date;
}

export interface CartInstance extends Sequelize.Instance<CartAttributes>, CartAttributes { }

export const SequelizeCart = storeDB.define<CartInstance, CartAttributes>('cart', {
  id: {
    type: Sequelize.UUIDV4,
    primaryKey: true
  },
  metadata: {
    type: Sequelize.JSON
  },
  items: {
    type: Sequelize.JSON
  }
}, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

@injectable()
export class SequelizeCartRepository implements CartRepository {

  constructor(
    @inject(type.RetailProductRepository) private retailProductRepository: RetailProductRepository
  ) { }

  public async findById(id: string): Promise<Cart> {
    return this.instanceToModel(await SequelizeCart.findById(id));
  }

  public async init(data: any): Promise<Cart> {
    const items = get(data, 'items') || [];
    const invoice = await this.calculateInvoice(items);
    const initData = {
      id: v4().toString(),
      metadata: {
        invoice,
      },
      items
    };
    const cart = this.instanceToModel(await SequelizeCart.create(initData));

    return cart;
  }

  public async update(id: string, data: any): Promise<Cart> {
    const items = get(data, 'items') || [];
    const invoice = await this.calculateInvoice(items);

    await SequelizeCart.update(
      { items, metadata: { invoice } },
      { where: { id } }
    );

    return this.findById(id);
  }

  private async instanceToModel(instance: CartInstance): Promise<Cart> {
    if (instance === null) {
      return null;
    }

    let cart = {
      id: instance.id.toString(),
      invoice: instance.metadata.invoice,
      items: instance.items,
      createdAt: instance.created_at,
      updatedAt: instance.updated_at
    };

    return cart;
  }

  private async calculateInvoice(items: CartItem[]): Promise<CartInvoice> {
    let invoice: CartInvoice = {
      discounts: 0,
      fees: 0,
      shipping: 0,
      subtotal: 0,
      tax: 0,
      total: 0
    };
    const variantIds = items.map(item => item.id);
    const cartItems = await this.retailProductRepository.list({ filter: { ids: variantIds } });
    const quantityMap = keyBy(items, 'id');
    invoice.subtotal = sumBy(cartItems, item => item.price * quantityMap[item.id].quantity);
    invoice.total = sum(values(omit(invoice, ['total'])));

    return invoice;
  }
}
