import { DesignLine } from '../models';

export interface DesignLineRepository {
  findById(id: string): Promise<DesignLine>;
}
