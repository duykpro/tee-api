import express, { Request, Response } from 'express';
import container from './container';
import { CampaignController, CartController, RetailProductController, ProductTemplateController, PaymentController, TaxonomyController, SearchController } from './controllers';
import { APIError } from './error';
import { NextFunction } from 'express-serve-static-core';
import { ShowCampaignRequest } from './requests/showCampaign';

const api = express.Router({ mergeParams: true });
const productTemplateController: ProductTemplateController = container.resolve<ProductTemplateController>(ProductTemplateController);
const taxonomyController: TaxonomyController = container.resolve<TaxonomyController>(TaxonomyController);
const campaignController: CampaignController = container.resolve<CampaignController>(CampaignController);
const cartController: CartController = container.resolve<CartController>(CartController);
const retailProductController: RetailProductController = container.resolve<RetailProductController>(RetailProductController);
const paymentController: PaymentController = container.resolve<PaymentController>(PaymentController);
const searchController: SearchController = container.resolve<SearchController>(SearchController);
// const showCampaignRequest: ShowCampaignRequest = container.resolve<ShowCampaignRequest>(ShowCampaignRequest);

// Middleware
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

// Routes
api.get('/taxonomies/:taxonomySlug/campaigns', taxonomyController.listCampaign.bind(taxonomyController));

api.get('/campaigns', campaignController.index.bind(campaignController));
api.get(
  '/campaigns/:campaignSlug',
  campaignController.show.bind(campaignController)
);

api.get('/generateMockupImage', productTemplateController.generate.bind(productTemplateController));

api.post('/carts', cartController.store.bind(cartController));
api.get('/carts/:cartId', cartController.show.bind(cartController));
api.put('/carts/:cartId', cartController.update.bind(cartController));

api.get('/retailProducts/:retailProductId', retailProductController.show.bind(retailProductController));

api.post('/payment/setup', paymentController.setup.bind(paymentController));
api.post('/payment/process', paymentController.process.bind(paymentController));

api.get('/search', searchController.search.bind(searchController));

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
