import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { ItemRepository } from '../itemRepository';
import { Item } from '../../models/item';
import { DataSource, Repository } from 'typeorm';


const mockRepository: any = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
};


const mockDataSource = {
  getRepository: jest.fn(() => mockRepository)
} as unknown as DataSource;


describe('ItemRepository', () => {
  let itemRepository: ItemRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    itemRepository = new ItemRepository(mockDataSource);
  });

  describe('findAll', () => {
    it('should return all items', async () => {
      const mockItems = [
        { id: 1, name: 'Item 1', price: 10.5 },
        { id: 2, name: 'Item 2', price: 20.75 }
      ];
      mockRepository.find.mockResolvedValue(mockItems);

      const result = await itemRepository.findAll();

      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockItems);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no items exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await itemRepository.findAll();

      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findById', () => {
    it('should return item by id when item exists', async () => {
      const mockItem = { id: 1, name: 'Test Item', price: 9.99 };
      mockRepository.findOneBy.mockResolvedValue(mockItem);

      const result = await itemRepository.findById(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockItem);
    });

    it('should return null when item does not exist', async () => {

      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await itemRepository.findById(999);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new item', async () => {
      const itemData = { name: 'New Item', price: 15.99 } as any;
      const createdItem = { id: 1, ...itemData };
      mockRepository.create.mockReturnValue(createdItem);
      mockRepository.save.mockResolvedValue(createdItem);

      const result = await itemRepository.create(itemData);

      expect(mockRepository.create).toHaveBeenCalledWith(itemData);
      expect(mockRepository.save).toHaveBeenCalledWith(createdItem);
      expect(result).toEqual(createdItem);
      expect(result.id).toBe(1);
      expect(result.name).toBe('New Item');
      expect(result.price).toBe(15.99);
    });
  });

  describe('update', () => {
    it('should update and return item when item exists', async () => {

      const existingItem = { id: 1, name: 'Old Name', price: 10 };
      const updateData = { name: 'Updated Name', price: 20 } as any;
      const updatedItem = { ...existingItem, ...updateData };
      
      mockRepository.findOneBy.mockResolvedValue(existingItem);
      mockRepository.save.mockResolvedValue(updatedItem);

      const result = await itemRepository.update(1, updateData);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Updated Name',
        price: 20
      }));
      expect(result).toEqual(updatedItem);
    });

    it('should return null when item does not exist', async () => {

      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await itemRepository.update(999, { name: 'New Name', price: 30 } as any);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true when item is deleted successfully', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await itemRepository.delete(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false when item does not exist', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await itemRepository.delete(999);

      expect(mockRepository.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
}); 