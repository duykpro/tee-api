import express, { Request, Response } from 'express';
import container from './container';
import { CampaignController, CartController, RetailProductController, ProductMockupController, PaymentController, TaxonomyController } from './controllers';
import { APIError } from './error';
import { NextFunction } from 'express-serve-static-core';

const api = express.Router({ mergeParams: true });
const productMockupController: ProductMockupController = container.resolve<ProductMockupController>(ProductMockupController);
const taxonomyController: TaxonomyController = container.resolve<TaxonomyController>(TaxonomyController);
const campaignController: CampaignController = container.resolve<CampaignController>(CampaignController);
const cartController: CartController = container.resolve<CartController>(CartController);
const retailProductController: RetailProductController = container.resolve<RetailProductController>(RetailProductController);
const paymentController: PaymentController = container.resolve<PaymentController>(PaymentController);

// Middleware
api.use(express.json());

// Routes
api.get('/taxonomies/:taxonomySlug/campaigns', taxonomyController.listCampaign.bind(taxonomyController));

api.get('/campaigns', campaignController.index.bind(campaignController));
api.get('/campaigns/:campaignSlug', campaignController.show.bind(campaignController));

api.get('/productMockups/:mockupId/:colorId/:designLineId', productMockupController.generate.bind(productMockupController));

api.post('/carts', cartController.store.bind(cartController));
api.get('/carts/:cartId', cartController.show.bind(cartController));
api.put('/carts/:cartId', cartController.update.bind(cartController));

api.get('/retailProducts/:retailProductId', retailProductController.show.bind(retailProductController));

api.post('/payment/setup', paymentController.setup.bind(paymentController));
api.post('/payment/process', paymentController.process.bind(paymentController));

// Error handling
api.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof APIError) {
    res.status(err.getHTTPStatus()).send(err.getResponse());
    return;
  }

  console.error(err);

  res.status(500).send('Something went wrong');
});

export default api;
