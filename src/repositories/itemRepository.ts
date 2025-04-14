import { Repository, DataSource } from 'typeorm';
import { Item } from '../models/item';
import { AppDataSource } from '../config/database';
import { ItemRepositoryInterface } from '../interfaces/item.interface';

export class ItemRepository implements ItemRepositoryInterface {
  private repository: Repository<Item>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(Item);
  }

  async findAll(): Promise<Item[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<Item | null> {
    return this.repository.findOneBy({ id });
  }

  async create(item: Omit<Item, 'id'>): Promise<Item> {
    const newItem = this.repository.create(item);
    return this.repository.save(newItem);
  }

  async update(id: number, item: Omit<Item, 'id'>): Promise<Item | null> {
    const existingItem = await this.findById(id);
    
    if (!existingItem) {
      return null;
    }
    
    Object.assign(existingItem, item);
    return this.repository.save(existingItem);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
} 