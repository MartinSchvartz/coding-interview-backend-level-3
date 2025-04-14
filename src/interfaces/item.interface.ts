export interface ItemInterface {
  id: number;
  name: string;
  price: number;
}

export interface ItemRepositoryInterface {
  findAll(): Promise<ItemInterface[]>;
  findById(id: number): Promise<ItemInterface | null>;
  create(item: Omit<ItemInterface, 'id'>): Promise<ItemInterface>;
  update(id: number, item: Omit<ItemInterface, 'id'>): Promise<ItemInterface | null>;
  delete(id: number): Promise<boolean>;
} 