import express, { Request, Response, NextFunction } from 'express';

import container from './container';
import {
  CampaignController,
  CartController,
  RetailProductController,
  ProductTemplateController,
  PaymentController,
  TaxonomyController
} from './controllers';
import { ErrorResponse } from './responses';
import { ShowCampaignRequest } from './requests/showCampaign';

const api = express.Router({ mergeParams: true });
const productTemplateController: ProductTemplateController = container.resolve<ProductTemplateController>(ProductTemplateController);
const taxonomyController: TaxonomyController = container.resolve<TaxonomyController>(TaxonomyController);
const campaignController: CampaignController = container.resolve<CampaignController>(CampaignController);
const cartController: CartController = container.resolve<CartController>(CartController);
const retailProductController: RetailProductController = container.resolve<RetailProductController>(RetailProductController);
const paymentController: PaymentController = container.resolve<PaymentController>(PaymentController);
// const showCampaignRequest: ShowCampaignRequest = container.resolve<ShowCampaignRequest>(ShowCampaignRequest);

// Middleware
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

// Routes
api.get('/taxonomies/:taxonomySlug/campaigns', taxonomyController.listCampaign.bind(taxonomyController));

// Campaign route
api.get(
  '/campaigns',
  campaignController.list.bind(campaignController)
);
api.get(
  '/campaigns/:campaignSlug',
  campaignController.show.bind(campaignController)
);

api.get('/generateMockupImage', productTemplateController.generate.bind(productTemplateController));

api.post('/carts', cartController.store.bind(cartController));
api.get('/carts/:cartId', cartController.show.bind(cartController));
api.put('/carts/:cartId', cartController.update.bind(cartController));
api.post('/carts/:cartId', cartController.addToCart.bind(cartController));

// Retail product route
api.get(
  '/retailProducts',
  retailProductController.list.bind(retailProductController)
);
api.get(
  '/retailProducts/:retailProductId',
  retailProductController.show.bind(retailProductController)
);

api.post('/payment/setup', paymentController.setup.bind(paymentController));
api.post('/payment/process', paymentController.process.bind(paymentController));

// Error handling
api.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorResponse) {
    res.status(err.getHTTPStatus()).send(err.getResponse());
    return;
  }

  console.error(err);

  res.status(500).send('Something went wrong');
});

export default api;
