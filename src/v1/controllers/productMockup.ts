import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import sharp, { SharpOptions } from 'sharp';
import { type } from '../constants/serviceIdentifier';
import { CampaignRepository } from '../repositories/campaign';
import { Campaign } from '../models/campaign';
import { ItemResponse, ListItemResponse } from '../responses';
import { APIError } from '../error';

@injectable()
export class ProductMockupController {
  constructor(
    @inject(type.CampaignRepository) private campaign: CampaignRepository
  ) { }

  public async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mockupId = req.params.mockupId;
      const colorId = req.params.colorId;
      const output = await sharp(null, <SharpOptions>{
          create: {
            width: 530,
            height: 630,
            channels: 4,
            background: '#ff00ff'
          }
        })
        .overlayWith('mockup.png')
        .png()
        .toBuffer({ resolveWithObject: true })

      res.type(`image/${output.info.format}`);
      res.send(output.data);
    } catch (e) {
      next(e);
    }
  }
}
