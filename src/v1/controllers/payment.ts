import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { type } from '../constants/serviceIdentifier';
import { CartRepository, RetailProductRepository, OrderRepository, OrderStatus } from '../repositories';
import { ItemResponse, ListItemResponse, ErrorResponse } from '../responses';
import paypal from 'paypal-rest-sdk';
import { paypal as paypalConfig } from '../config/payment';
import { Domain, Code, Reason, SourceType } from '../constants/error';
import { Order, OrderItem } from '../models';
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
    @inject(type.OrderRepository) private orderRepository: OrderRepository,
    @inject(type.RetailProductRepository) private retailProductRepository: RetailProductRepository
  ) { }

  public async setup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cartId = req.body.cartId;
      const billing = req.body.billing;
      const shipping = req.body.shipping;
      const paymentMethod = req.body.paymentMethod;
      let cart = await this.cartRepository.update(cartId, { billing, shipping, paymentMethod });

      if (cart === null) {
        throw new ErrorResponse({
          domain: Domain.Payment,
          code: Code.NotFound,
          reason: Reason.CartNotFound,
          message: 'Cart not found.',
          sourceType: SourceType.RequestBody,
          source: 'cartId'
        });
      }

      if (cart.items.length <= 0) {
        throw new ErrorResponse({
          domain: Domain.Payment,
          code: Code.BadRequest,
          reason: Reason.CartIsEmpty,
          message: 'Cart is empty.',
          sourceType: SourceType.RequestBody,
          source: 'cartId'
        });
      }

      const variantIds = cart.items.map(item => item.id);
      const cartItems = await this.retailProductRepository.list({ filter: { ids: variantIds } });
      const quantityMap = keyBy(cart.items, 'id');
      let items: OrderItem[] = [];
      cartItems.forEach(item => {
        const quantity = quantityMap[item.id].quantity;
        const subtotal = item.price * quantity;

        items.push({
          id: item.id,
          sku: item.sku,
          name: item.name,
          quantity: quantity,
          price: item.price,
          subtotal: subtotal,
          total: subtotal
        });
      });

      let order: Order;

      if (cart.orderId) {
        order = await this.orderRepository.update(cart.orderId, { items, billing, shipping, paymentMethod, status: OrderStatus.PendingPayment });
      } else {
        order = await this.orderRepository.create({ items, billing, shipping, paymentMethod, status: OrderStatus.PendingPayment });
        cart = await this.cartRepository.update(cartId, { 'orderId': order.id });
      }

      paypal.payment.create({
        intent: 'sale',
        payer: {
          'payment_method': 'paypal'
        },
        redirect_urls: {
          return_url: `${process.env.FRONTEND_BASE_URL}/payment/successful`,
          cancel_url: `${process.env.FRONTEND_BASE_URL}/payment/cancelled`
        },
        transactions: [
          {
            reference_id: order.id,
            item_list: {
              items: items.map(item => {
                return {
                  sku: item.sku,
                  name: item.name,
                  price: (item.price / 100).toString(),
                  currency: 'USD',
                  quantity: item.quantity
                };
              }),
              // shipping_address: {
              //   line1: order.shipping.address1,
              //   line2: order.shipping.address2,
              //   city: order.shipping.city,
              //   country_code: order.shipping.country,
              //   postal_code: order.shipping.postalCode,
              //   state: order.shipping.state,
              //   phone: order.shipping.phone
              // }
            },
            amount: {
              currency: 'USD',
              total: (order.total / 100).toString(),
              details: {
                subtotal: (order.details.subtotal / 100).toString(),
                shipping: (order.details.shipping / 100).toString(),
                tax: (order.details.tax / 100).toString(),
                handling_fee: (order.details.fees / 100).toString()
              }
            }
          }
        ]
      }, (err, payment) => {
        if (err !== null) {
          next(err);
        } else {
          res.status(200).send({
            paypal: {
              paymentId: payment.id,
              payment
            }
          });
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
        throw new ErrorResponse({
          domain: Domain.Payment,
          code: Code.NotFound,
          reason: Reason.CartNotFound,
          message: 'Cart not found.',
          sourceType: SourceType.RequestBody,
          source: 'cartId'
        });
      }

      paypal.payment.execute(paymentId, {
        payer_id: payerId
      }, async (err, response) => {
        if (err !== null) {
          next(err);
        } else {
          let order = await this.orderRepository.update(cart.orderId, {
            paymentMethod: 'paypal',
            transactionId: response.id,
            status: OrderStatus.Completed,
            paidAt: new Date(),
            completedAt: new Date()
          });
          await this.cartRepository.delete(cart.id);

          res.status(200).send(order);
        }
      });
    } catch (e) {
      next(e);
    }
  }

}
