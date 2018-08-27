import { injectable, inject } from 'inversify';
import Sequelize from 'sequelize';
import { v4 } from 'uuid';
import { keyBy, omit, get, values, sum, sumBy, has, isEmpty, forEach, pick } from 'lodash';
import camelCase from 'camelcase';

import { type } from '../../constants/serviceIdentifier';
import { CartRepository, RetailProductRepository } from '..';
import { storeDB } from '../../storage/sequelize';
import { Cart, CartInvoice, CartItem, PersonInfo } from '../../models';

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
    order_id?: string;
    billing?: {
      first_name: string;
      last_name: string;
      company?: string;
      address_1: string;
      address_2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
      email: string;
      phone: string;
    };
    shipping?: {
      first_name: string;
      last_name: string;
      company?: string;
      address_1: string;
      address_2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
      email: string;
      phone: string;
    };
    payment_method?: string;
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
    data = await this.normalizePostData(data);
    data.id = v4().toString();
    data.metadata = {};

    if (!has(data, 'items')) {
      data['items'] = [];
    }

    const cart = this.instanceToModel(await SequelizeCart.create(data));

    return cart;
  }

  public async update(id: string, data: any): Promise<Cart> {
    let instance = await SequelizeCart.findById(id);

    if (instance === null) {
      return null;
    }

    forEach(await this.normalizePostData(data), (value, key) => {
      instance.set(key, value);
    });

    instance.save();

    return this.instanceToModel(instance);
  }

  public async delete(id: string): Promise<boolean> {
    let instance = await SequelizeCart.findById(id);

    if (instance === null) {
      return false;
    }

    await instance.destroy();

    return true;
  }

  private async instanceToModel(instance: CartInstance): Promise<Cart> {
    if (instance === null) {
      return null;
    }

    let billing: any = {};
    let shipping: any = {};

    if (instance.metadata) {
      Object.keys(instance.metadata.billing || {}).forEach(key => {
        billing[camelCase(key)] = instance.metadata.billing[key];
      });

      Object.keys(instance.metadata.shipping || {}).forEach(key => {
        shipping[camelCase(key)] = instance.metadata.shipping[key];
      });
    }

    let cart = {
      id: instance.id.toString(),
      invoice: instance.metadata.invoice,
      billing: billing,
      shipping: shipping,
      orderId: instance.metadata.order_id && instance.metadata.order_id.toString(),
      paymentMethod: instance.metadata.payment_method,
      items: instance.items || [],
      createdAt: instance.created_at,
      updatedAt: instance.updated_at
    };

    const variantIds = instance.items.map(item => item.id);

    if (variantIds.length > 0) {
      const cartItems = await this.retailProductRepository.list({ filter: { ids: variantIds } });
      const itemMap = keyBy(instance.items, 'id');
      cart.items = cartItems.map(item => {
        return Object.assign(itemMap[item.id], { product: item });
      });
    }

    return cart;
  }

  private async normalizePostData(source: any): Promise<any> {
    let data: any = {
    };

    if (has(source, 'items')) {
      data['items'] = get(source, 'items');
    }

    if (has(source, 'orderId')) {
      data['metadata.order_id'] = get(source, 'orderId');
    }

    if (has(source, 'paymentMethod')) {
      data['metadata.payment_method'] = get(source, 'paymentMethod');
    }

    if (data.items) {
      data['metadata.invoice'] = await this.calculateInvoice(data.items);
    }

    const billing = get(source, 'billing');

    if (!isEmpty(billing)) {
      data['metadata.billing'] = this.normalizePersonInfoFields(billing);
    }

    const shipping = get(source, 'shipping');

    if (!isEmpty(shipping)) {
      data['metadata.shipping'] = this.normalizePersonInfoFields(shipping);
    }

    return data;
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

    if (items.length <= 0) {
      return invoice;
    }

    const variantIds = items.map(item => item.id);
    const cartItems = await this.retailProductRepository.list({ filter: { ids: variantIds } });
    const quantityMap = keyBy(items, 'id');
    invoice.subtotal = sumBy(cartItems, item => item.price * quantityMap[item.id].quantity);
    invoice.total = sum(values(omit(invoice, ['total'])));

    return invoice;
  }

  private normalizePersonInfoFields(source: PersonInfo): any {
    let info: any = pick(source, ['company', 'city', 'state', 'country', 'email', 'phone']);
    info.first_name = get(source, 'firstName');
    info.last_name = get(source, 'lastName');
    info.address_1 = get(source, 'address1');
    info.address_2 = get(source, 'address2');
    info.postal_code = get(source, 'postalCode');

    return info;
  }

}
