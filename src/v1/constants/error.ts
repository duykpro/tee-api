export enum Domain {
  Campaign = 'printabel.campaign',
  RetailProduct = 'printabel.retailProduct',
  Cart = 'printabel.cart',
  Payment = 'printabel.payment',
  Taxonomy = 'printabel.taxonomy'
};

export enum Code {
  BadRequest = '400',
  NotFound = '404'
};

export enum Reason {
  CampaignNotFound = 'campaignNotFound',
  RetailProductNotFound = 'retailProductNotFound',
  CartNotFound = 'cartNotFound',
  CartIsEmpty = 'cartIsEmpty',
  TaxonomyNotFound = 'taxonomyNotFound'
};

export enum SourceType {
  Parameter = 'parameter',
  RequestBody = 'requestBody'
};
