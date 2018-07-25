import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import sharp, { SharpOptions } from 'sharp';
import { Storage } from '@google-cloud/storage';
import { type } from '../constants/serviceIdentifier';
import { ProductMockupRepository, DesignLineRepository, ProductColorRepository } from '../repositories';
import { DesignLine } from '../models';

// const storage  = new Storage({
//   keyFilename: 'key.json',
// })
// const bucket = storage.bucket('cloud.printabel.com')

@injectable()
export class ProductMockupController {
  constructor(
    @inject(type.ProductColorRepository) private productColorRepository: ProductColorRepository,
    @inject(type.ProductMockupRepository) private productMockupRepository: ProductMockupRepository,
    @inject(type.DesignLineRepository) private designLineRepository: DesignLineRepository
  ) { }

  public async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mockupId = req.params.mockupId;
      const colorId = req.params.colorId;
      const designLineId = req.params.designLineId;

      const mockup = this.productMockupRepository.findById(mockupId);
      const color = this.productColorRepository.findById(colorId);
      const designLine = this.designLineRepository.findById(designLineId);

      // console.log(designLineData);

      // console.log(mockupData.printable.width / 11.9);
      // Tính kích thước vùng in từ pixel qua inch
      // console.log(mockupData.printable.width / 18.4137931034483);
      // console.log(mockupData.printable.height / 18.4137931034483);
      // Tính DPI
      // Chiều gốc của ảnh / giá trị đã thu nhỏ / pixel_to_inch_ratio
      // console.log(w / 82.9616 * 18.4137931034483);
      // Tính từ pixel qua inch
      // Pixel / pixel_to_inch_ratio
      // console.log(82.9616 / 18.4137931034483);


      const printable = await sharp(null, {
        create: {
          width: mockupData.printable.width,
          height: mockupData.printable.height,
          channels: 4,
          background: '#ff0000'
        }
      }).png().toBuffer();
      const artwork = await sharp('artwork.jpeg').resize(designLineData.dimensions.width, designLineData.dimensions.height).toBuffer();
      const base = await sharp(null, {
          create: {
            width: mockupData.dimensions.width,
            height: mockupData.dimensions.height,
            channels: 4,
            background: '#ffeeff'
          }
        }).overlayWith(artwork, {
          top: designLineData.position.top,
          left: designLineData.position.left
        }).png().toBuffer();
      const ok = await sharp(base).overlayWith(artwork).toBuffer();

      const output = await sharp(base)
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
