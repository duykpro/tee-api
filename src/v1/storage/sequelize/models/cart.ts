import Sequelize from 'sequelize';
import { storeDB } from '..';
import { Cart as CartModel, CartItem } from '../../../models';

export interface CartInstance extends Sequelize.Instance<CartModel>, CartModel { }

export const Cart = storeDB.define<CartInstance, CartModel>('cart', {
  id: {
    type: Sequelize.UUIDV4,
    primaryKey: true
  },
  items: {
    type: Sequelize.JSON
  }
}, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
