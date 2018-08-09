import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { pick } from 'lodash';

import { type } from '../constants/serviceIdentifier';
import { Domain, Code, Reason, SourceType } from '../constants/error';
import { CartRepository } from '../repositories';
import { APIError } from '../error';

@injectable()
export class CartController {
  constructor(
    @inject(type.CartRepository) private cartRepository: CartRepository
  ) { }

  public async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.cartId;
      const cart = await this.cartRepository.findById(id);

      if (cart === null) {
        throw new APIError({
          domain: Domain.Cart,
          code: Code.NotFound,
          reason: Reason.CartNotFound,
          message: 'The cart identified with the requests cartId parameter cannot be found.',
          sourceType: SourceType.Parameter,
          source: 'cartId'
        });
      }

      res.status(200).send(cart);
    } catch (e) {
      next(e);
    }
  }

  public async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const cart = await this.cartRepository.init(pick(data, ['items', 'billing', 'shipping']));

      res.status(200).send(cart);
    } catch (e) {
      next(e);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.cartId;
      const data = req.body;
      let cart = await this.cartRepository.findById(id);

      if (cart === null) {
        throw new APIError({
          domain: Domain.Cart,
          code: Code.NotFound,
          reason: Reason.CartNotFound,
          message: 'The cart identified with the requests cartId parameter cannot be found.',
          sourceType: SourceType.Parameter,
          source: 'cartId'
        });
      }

      cart = await this.cartRepository.update(cart.id, pick(data, ['items', 'billing', 'shipping']));
      res.status(200).send(cart);
    } catch (e) {
      next(e);
    }
  }

}
