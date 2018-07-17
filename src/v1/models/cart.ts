export interface Cart {
  id?: string;
  items?: CartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  id: string;
  quantity: number;
}
