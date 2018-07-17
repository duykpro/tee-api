import { Container } from 'inversify';
import { type } from './constants/serviceIdentifier';
import {
  CampaignRepository,
  SequelizeCampaignRepository,
  CartRepository,
  SequelizeCartRepository,
  RetailProductRepository,
  SequelizeRetailProductRepository,
} from './repositories';

let container = new Container();
container.bind<CampaignRepository>(type.CampaignRepository).to(SequelizeCampaignRepository);
container.bind<CartRepository>(type.CartRepository).to(SequelizeCartRepository);
container.bind<RetailProductRepository>(type.RetailProductRepository).to(SequelizeRetailProductRepository);

export default container;
