import { ItemInterface, ItemRepositoryInterface } from '../interfaces/item.interface';
import { ItemRepository } from '../repositories/itemRepository';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/database';

interface ValidationError {
  field: string;
  message: string;
}

export class ItemService {
  private itemRepository: ItemRepositoryInterface;

  constructor(repository?: ItemRepositoryInterface, dataSource: DataSource = AppDataSource) {
    this.itemRepository = repository || new ItemRepository(dataSource);
  }

  async getAllItems(): Promise<ItemInterface[]> {
    return this.itemRepository.findAll();
  }

  async getItemById(id: number): Promise<ItemInterface | null> {
    return this.itemRepository.findById(id);
  }

  async createItem(name: string, price: number): Promise<ItemInterface> {
    this.validateItemData(name, price);
    return this.itemRepository.create({ name, price });
  }

  async updateItem(id: number, name: string, price: number): Promise<ItemInterface | null> {
    this.validateItemData(name, price);
    return this.itemRepository.update(id, { name, price });
  }

  async deleteItem(id: number): Promise<boolean> {
    return this.itemRepository.delete(id);
  }

  private validateItemData(name: string, price: number): void {
    const errors: ValidationError[] = [];

    if (!name) {
      errors.push({
        field: 'name',
        message: 'Field "name" is required'
      });
    }

    if (price === undefined || price === null) {
      errors.push({
        field: 'price',
        message: 'Field "price" is required'
      });
    } else if (price < 0) {
      errors.push({
        field: 'price',
        message: 'Field "price" cannot be negative'
      });
    }

    if (errors.length > 0) {
      throw { errors };
    }
  }
} 