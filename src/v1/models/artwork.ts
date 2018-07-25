export type Artwork = {
  id: string;
  path: string;
  size?: number;
  minetype?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  uploadedAt: Date;
  updatedAt: Date;
}
