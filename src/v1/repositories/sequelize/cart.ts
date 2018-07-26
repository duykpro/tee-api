import { injectable } from 'inversify';
import { v4 } from 'uuid';
import { pick, get } from 'lodash';
import camelCase from 'camelcase';
import { CartRepository } from '../cart';
import { Cart } from '../../models';
import {
  Cart as SequelizeCart,
  CartInstance
} from '../../storage/sequelize/models';

@injectable()
export class SequelizeCartRepository implements CartRepository {
  public async findById(id: string): Promise<Cart> {
    const cart = this.instanceToModel(await SequelizeCart.findById(id));

    return cart as Cart;
  }

  public async init(data?: Cart): Promise<Cart> {
    const initData = {
      id: v4().toString(),
      items: get(data, 'items') || []
    };
    const cart = this.instanceToModel(await SequelizeCart.create(initData));

    return cart;
  }

  public async create(): Promise<Cart> {
    const cart = await SequelizeCart.create({
      id: v4().toString(),
      items: []
    });

    return cart;
  }

  public async update(cart: Cart): Promise<boolean> {
    await SequelizeCart.update(pick(cart, ['items']), {
        where: {
          id: cart.id
        }
      });

    return true;
  }

  private instanceToModel(source: CartInstance): Cart {
    let cart = <Cart>{};

    Object.keys(source.get()).forEach(key => {
      cart[camelCase(key)] = source[key];
    });

    return cart;
  }
}
