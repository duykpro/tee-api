import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import sharp, { SharpOptions } from 'sharp';
import Storage from '@google-cloud/storage';
import { type } from '../constants/serviceIdentifier';
import { ProductTemplateRepository, DesignLineRepository, ProductColorRepository } from '../repositories';
import { DesignLine } from '../models';

const storage = Storage({
  keyFilename: 'key.json',
});
const bucket = storage.bucket('cloud.printabel.com');
const assetsBucket = storage.bucket('printabel-assets');

@injectable()
export class ProductTemplateController {
  constructor(
    @inject(type.ProductColorRepository) private productColorRepository: ProductColorRepository,
    @inject(type.ProductTemplateRepository) private productTemplateRepository: ProductTemplateRepository,
    @inject(type.DesignLineRepository) private designLineRepository: DesignLineRepository
  ) { }

  public async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = req.query.templateId || 1;
      const colorId = req.query.colorId || 1;
      const designLineId = req.query.designLineId || 1;

      const template = await this.productTemplateRepository.findById(templateId);
      const color = await this.productColorRepository.findById(colorId);
      const designLine = await this.designLineRepository.findById(designLineId);

      // console.log(designLineData);

      // console.log(templateData.printable.width / 11.9);
      // Tính kích thước vùng in từ pixel qua inch
      // console.log(templateData.printable.width / 18.4137931034483);
      // console.log(templateData.printable.height / 18.4137931034483);
      // Tính DPI
      // Chiều gốc của ảnh / giá trị đã thu nhỏ / pixel_to_inch_ratio
      // console.log(w / 82.9616 * 18.4137931034483);
      // Tính từ pixel qua inch
      // Pixel / pixel_to_inch_ratio
      // console.log(82.9616 / 18.4137931034483);


      // const printable = await sharp(null, {
      //   create: {
      //     width: templateData.printable.width,
      //     height: templateData.printable.height,
      //     channels: 4,
      //     background: '#ff0000'
      //   }
      // }).png().toBuffer();


      let base = await sharp(null, {
          create: {
            width: template.dimensions.width,
            height: template.dimensions.height,
            channels: 4,
            background: color.hex
          }
        });

      if (designLine.sides.hasOwnProperty(template.side)) {
        const artwork = await sharp((await bucket.file(designLine.sides[template.side].artwork.path).download())[0])
          .resize(
            Math.round(designLine.sides[template.side].details.widthInch * template.ppi),
            Math.round(designLine.sides[template.side].details.heightInch * template.ppi)
          )
          .ignoreAspectRatio()
          .toBuffer();

        base = base.overlayWith(artwork, {
          top: template.printable.top + Math.round(designLine.sides[template.side].position.y),
          left: template.printable.left + Math.round(designLine.sides[template.side].position.x)
        });
      }

      const output = await sharp(await base.png().toBuffer())
        .overlayWith((await assetsBucket.file(template.image).download())[0])
        .jpeg()
        .toBuffer({ resolveWithObject: true })

      res.type(`image/${output.info.format}`);
      res.send(output.data);
    } catch (e) {
      next(e);
    }
  }
}
