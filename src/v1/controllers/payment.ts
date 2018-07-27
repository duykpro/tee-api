import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { type } from '../constants/serviceIdentifier';
import { CartRepository, RetailProductRepository } from '../repositories';
import { Campaign } from '../models/campaign';
import { ItemResponse, ListItemResponse } from '../responses';
import { APIError } from '../error';
import paypal from 'paypal-rest-sdk';
import paypalConfig from '../config/paypal';
import { keyBy } from 'lodash';

paypal.configure({
  mode: paypalConfig.mode,
  client_id: paypalConfig.clientId,
  client_secret: paypalConfig.clientSecret
});

@injectable()
export class PaymentController {
  constructor(
    @inject(type.CartRepository) private cartRepository: CartRepository,
    @inject(type.RetailProductRepository) private retailProductRepository: RetailProductRepository
  ) { }

  public async setup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cartId = req.body.cartId;
      const cart = await this.cartRepository.findById(cartId);

      if (cart === null) {
        throw new APIError({
          domain: 'tee.cart',
          code: '404',
          reason: 'cartNotFound',
          message: 'The cart identified with the requests cartId parameter cannot be found.',
          sourceType: 'parameter',
          source: 'cartId'
        });
      }

      const variantIds = cart.items.map(item => item.id);
      const cartItems = await this.retailProductRepository.list({ filter: { ids: variantIds } });
      const quantityMap = keyBy(cart.items, 'id');
      let items = [];
      cartItems.forEach(item => {
        items.push({
          sku: item.sku,
          name: item.name,
          description: item.name,
          quantity: quantityMap[item.id].quantity,
          price: (item.price / 100).toString(),
          currency: 'USD'
        });
      });

      paypal.payment.create({
        intent: 'sale',
        payer: {
          'payment_method': 'paypal'
        },
        redirect_urls: {
          return_url: 'https://printabel.com',
          cancel_url: 'https://printabel.com'
        },
        transactions: [
          {
            reference_id: cart.id,
            item_list: {
              items,
              shipping_address: {
                line1: '1148  Millbrook Road',
                line2: '',
                city: 'HATFIELD',
                country_code: 'US',
                postal_code: '01038',
                state: 'Massachusetts',
                phone: '(630) 791 0387'
              },
              shipping_phone_number: '(202) 456 1111'
            },
            amount: {
              currency: 'USD',
              total: (cart.invoice.total / 100).toString(),
              details: {
                subtotal: (cart.invoice.subtotal / 100).toString(),
                shipping: (cart.invoice.shipping / 100).toString(),
                tax: (cart.invoice.tax / 100).toString(),
                handling_fee: (cart.invoice.fees / 100).toString()
              }
            }
          }
        ]
      }, (err, payment) => {
        if (err !== null) {
          next(err);
        } else {
          res.status(200).send(payment);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  public async process(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cartId = req.body.cartId;
      const paymentId = req.body.paymentId;
      const payerId = req.body.payerId;
      const cart = await this.cartRepository.findById(cartId);

      if (cart === null) {
        throw new APIError({
          domain: 'tee.cart',
          code: '404',
          reason: 'cartNotFound',
          message: 'The cart identified with the requests cartId parameter cannot be found.',
          sourceType: 'parameter',
          source: 'cartId'
        });
      }

      paypal.payment.execute(paymentId, {
        payer_id: payerId
      }, (err, response) => {
        if (err !== null) {
          next(err);
        } else {
          res.status(200).send(response);
        }
      });
    } catch (e) {
      next(e);
    }
  }

}
