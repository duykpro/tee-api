import { Container } from 'inversify';
import { type } from './constants/serviceIdentifier';
import {
  ArtworkRepository,
  ProductColorRepository,
  ProductTemplateRepository,
  TaxonomyRepository,
  CampaignRepository,
  DesignLineRepository,
  CartRepository,
  OrderRepository,
  RetailProductRepository,
  SequelizeArtworkRepository,
  SequelizeProductColorRepository,
  SequelizeProductTemplateRepository,
  SequelizeTaxonomyRepository,
  SequelizeCampaignRepository,
  SequelizeDesignLineRepository,
  SequelizeCartRepository,
  SequelizeOrderRepository,
  SequelizeRetailProductRepository
} from './repositories';

let container = new Container();
container.bind<ArtworkRepository>(type.ArtworkRepository).to(SequelizeArtworkRepository);
container.bind<ProductColorRepository>(type.ProductColorRepository).to(SequelizeProductColorRepository);
container.bind<ProductTemplateRepository>(type.ProductTemplateRepository).to(SequelizeProductTemplateRepository);
container.bind<TaxonomyRepository>(type.TaxonomyRepository).to(SequelizeTaxonomyRepository);
container.bind<CampaignRepository>(type.CampaignRepository).to(SequelizeCampaignRepository);
container.bind<DesignLineRepository>(type.DesignLineRepository).to(SequelizeDesignLineRepository);
container.bind<CartRepository>(type.CartRepository).to(SequelizeCartRepository);
container.bind<OrderRepository>(type.OrderRepository).to(SequelizeOrderRepository);
container.bind<RetailProductRepository>(type.RetailProductRepository).to(SequelizeRetailProductRepository);

export default container;
