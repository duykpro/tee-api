import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { type } from '../constants/serviceIdentifier';
import { RetailProductRepository } from '../repositories';
import { APIError } from '../error';

@injectable()
export class RetailProductController {
  constructor(
    @inject(type.RetailProductRepository) private retailProduct: RetailProductRepository
  ) { }

  public async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.retailProductId;
      const cart = await this.retailProduct.findById(id);

      if (cart === null) {
        throw new APIError({
          domain: 'tee.cart',
          code: '404',
          reason: 'retailProductNotFound',
          message: 'The retail product identified with the requests retailProductId parameter cannot be found.',
          sourceType: 'parameter',
          source: 'retailProductId'
        });
      }

      res.status(200).send(cart);
    } catch (e) {
      next(e);
    }
  }

}
