import express, { Request, Response } from 'express';
import container from './container';
import { CampaignController, CartController, RetailProductController } from './controllers';
import { APIError } from './error';
import { NextFunction } from '../../node_modules/@types/express-serve-static-core';

const api = express.Router({ mergeParams: true });
const campaignController: CampaignController = container.resolve<CampaignController>(CampaignController);
const cartController: CartController = container.resolve<CartController>(CartController);
const retailProductController: RetailProductController = container.resolve<RetailProductController>(RetailProductController);

// Middleware
api.use(express.json());

// Routes
api.get('/campaigns', campaignController.index.bind(campaignController));
api.get('/campaigns/:campaignId', campaignController.show.bind(campaignController));

api.post('/carts', cartController.store.bind(cartController));
api.get('/carts/:cartId', cartController.show.bind(cartController));
api.put('/carts/:cartId', cartController.update.bind(cartController));

api.get('/retailProducts/:retailProductId', retailProductController.show.bind(retailProductController));

// Error handling
api.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof APIError) {
    res.status(err.getHTTPStatus()).send(err.getResponse());
    return;
  }

  console.log(err.message);

  res.status(500).send('Something went wrong');
});

export default api;
