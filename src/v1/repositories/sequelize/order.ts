import { injectable, inject } from 'inversify';
import Sequelize from 'sequelize';
import { v4 } from 'uuid';
import { keyBy, omit, get, values, sum, sumBy, has, isEmpty, forEach, pick } from 'lodash';
import camelCase from 'camelcase';

import { type } from '../../constants/serviceIdentifier';
import { OrderRepository, RetailProductRepository } from '..';
import { storeDB } from '../../storage/sequelize';
import { Order, OrderDetails, OrderItem, PersonInfo } from '../../models';

interface OrderAttributes {
  id: string;
  metadata: {
    total?: number;
    details?: {
      discounts: number;
      fees: number;
      shipping: number;
      subtotal: number;
      tax: number;
    };
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
    transaction_id?: string;
    customer_note?: string;
  };
  items: {
    id: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    subtotal: number;
    total: number;
  }[];
  status: number;
  paid_at?: Date;
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface OrderInstance extends Sequelize.Instance<OrderAttributes>, OrderAttributes { }

export const SequelizeOrder = storeDB.define<OrderInstance, OrderAttributes>('order', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  metadata: {
    type: Sequelize.JSON
  },
  items: {
    type: Sequelize.JSON
  },
  status: {
    type: Sequelize.TINYINT
  },
  paid_at: {
    type: Sequelize.DATE
  },
  completed_at: {
    type: Sequelize.DATE
  }
}, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

@injectable()
export class SequelizeOrderRepository implements OrderRepository {

  constructor(
    @inject(type.RetailProductRepository) private retailProductRepository: RetailProductRepository
  ) { }

  public async findById(id: string): Promise<Order> {
    return this.instanceToModel(await SequelizeOrder.findById(id));
  }

  public async create(data: any): Promise<Order> {
    data = await this.normalizePostData(data);
    const order = this.instanceToModel(await SequelizeOrder.create(data));

    return order;
  }

  public async update(id: string, data: any): Promise<Order> {
    let instance = await SequelizeOrder.findById(id);

    if (instance === null) {
      return null;
    }

    forEach(await this.normalizePostData(data), (value, key) => {
      instance.set(key, value);
    });

    instance.save();

    return this.instanceToModel(instance);
  }

  private async instanceToModel(instance: OrderInstance): Promise<Order> {
    if (instance === null) {
      return null;
    }

    let billing: any = {};

    Object.keys(get(instance, 'metadata.billing', {})).forEach(key => {
      billing[camelCase(key)] = instance.metadata.billing[key];
    });

    let shipping: any = {};

    Object.keys(get(instance, 'metadata.shipping', {})).forEach(key => {
      shipping[camelCase(key)] = instance.metadata.shipping[key];
    });

    let order = {
      id: instance.id.toString(),
      total: get(instance, 'metadata.total', 0),
      details: get(instance, 'metadata.details', {}),
      billing,
      shipping,
      items: get(instance, 'items', []),
      paymentMethod: get(instance, 'metadata.payment_method', null),
      transactionId: get(instance, 'metadata.transaction_id', null),
      customerNote: get(instance, 'metadata.customer_note', null),
      status: get(instance, 'status', null),
      isPaid: get(instance, 'paid_at') !== null,
      paidAt: get(instance, 'paid_at', null),
      completedAt: get(instance, 'completed_at', null),
      createdAt: get(instance, 'created_at', null),
      updatedAt: get(instance, 'updated_at', null)
    };

    return order;
  }

  private async normalizePostData(source: any): Promise<any> {
    let data: any = {
    };

    if (has(source, 'items')) {
      data['items'] = get(source, 'items');
    }

    if (has(source, 'status')) {
      data['status'] = get(source, 'status');
    }

    if (has(source, 'paidAt')) {
      data['paid_at'] = get(source, 'paidAt');
    }

    if (has(source, 'completedAt')) {
      data['completed_at'] = get(source, 'completedAt');
    }

    if (has(source, 'paymentMethod')) {
      data['metadata.payment_method'] = get(source, 'paymentMethod');
    }

    if (has(source, 'transactionId')) {
      data['metadata.transaction_id'] = get(source, 'transactionId');
    }

    if (has(source, 'customerNote')) {
      data['metadata.customer_note'] = get(source, 'customerNote');
    }

    if (data.items) {
      data['metadata.details'] = await this.calculate(data.items);
      data['metadata.total'] = data['metadata.details'].subtotal;
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

  private async calculate(items: OrderItem[]): Promise<OrderDetails> {
    let details: OrderDetails = {
      discounts: 0,
      fees: 0,
      shipping: 0,
      subtotal: 0,
      tax: 0
    };

    if (items.length <= 0) {
      return details;
    }

    details.subtotal = sumBy(items, item => item.total);

    return details;
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
