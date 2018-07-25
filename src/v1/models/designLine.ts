import { Artwork } from "./artwork";

export type DesignLine = {
  id: string;
  sides: {
    [key: string]: {
      artwork: Artwork;
      details: {
        dpi: number;
        widthInch: number;
        heightInch: number;
      };
      position: {
        x: number;
        y: number;
      };
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
