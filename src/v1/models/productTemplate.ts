export type ProductTemplate = {
  id: string;
  name: string;
  description: string;
  side: string;
  image: string;
  dimensions: {
    width: number;
    height: number;
  };
  printable: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  ppi: number;
  canUseForDesign: boolean;
  createdAt: Date;
  updatedAt: Date;
}
