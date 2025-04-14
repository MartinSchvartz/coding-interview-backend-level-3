import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ItemService } from '../itemService';
import { ItemRepositoryInterface } from '../../interfaces/item.interface';


const mockItemRepository: jest.Mocked<ItemRepositoryInterface> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

describe('ItemService', () => {
  let itemService: ItemService;

  beforeEach(() => {
    jest.clearAllMocks();
    itemService = new ItemService(mockItemRepository);
  });

  describe('getAllItems', () => {
    it('should return all items from repository', async () => {
      const mockItems = [
        { id: 1, name: 'Item 1', price: 10 },
        { id: 2, name: 'Item 2', price: 20 }
      ];
      mockItemRepository.findAll.mockResolvedValue(mockItems);

      const result = await itemService.getAllItems();

      expect(mockItemRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockItems);
    });
  });

  describe('getItemById', () => {
    it('should return item by id when item exists', async () => {
      const mockItem = { id: 1, name: 'Test Item', price: 15.5 };
      mockItemRepository.findById.mockResolvedValue(mockItem);

      const result = await itemService.getItemById(1);

      expect(mockItemRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockItem);
    });

    it('should return null when item does not exist', async () => {
      mockItemRepository.findById.mockResolvedValue(null);

      const result = await itemService.getItemById(999);

      expect(mockItemRepository.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('createItem', () => {
    it('should create and return a new item with valid data', async () => {
      const name = 'New Item';
      const price = 25.5;
      const createdItem = { id: 1, name, price };
      mockItemRepository.create.mockResolvedValue(createdItem);

      const result = await itemService.createItem(name, price);

      expect(mockItemRepository.create).toHaveBeenCalledWith({ name, price });
      expect(result).toEqual(createdItem);
    });

    it('should throw error when name is missing', async () => {
      await expect(itemService.createItem('', 10)).rejects.toEqual({
        errors: [{ field: 'name', message: 'Field "name" is required' }]
      });
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when price is missing', async () => {
      await expect(itemService.createItem('Test', null as unknown as number)).rejects.toEqual({
        errors: [{ field: 'price', message: 'Field "price" is required' }]
      });
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when price is negative', async () => {
      await expect(itemService.createItem('Test', -10)).rejects.toEqual({
        errors: [{ field: 'price', message: 'Field "price" cannot be negative' }]
      });
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });

    it('should throw multiple validation errors when multiple fields are invalid', async () => {
      await expect(itemService.createItem('', -5)).rejects.toEqual({
        errors: [
          { field: 'name', message: 'Field "name" is required' },
          { field: 'price', message: 'Field "price" cannot be negative' }
        ]
      });
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('should update and return item when item exists and data is valid', async () => {
      const id = 1;
      const name = 'Updated Item';
      const price = 30;
      const updatedItem = { id, name, price };
      mockItemRepository.update.mockResolvedValue(updatedItem);

      const result = await itemService.updateItem(id, name, price);

      expect(mockItemRepository.update).toHaveBeenCalledWith(id, { name, price });
      expect(result).toEqual(updatedItem);
    });

    it('should return null when item does not exist', async () => {
      mockItemRepository.update.mockResolvedValue(null);

      const result = await itemService.updateItem(999, 'Test', 10);

      expect(mockItemRepository.update).toHaveBeenCalledWith(999, { name: 'Test', price: 10 });
      expect(result).toBeNull();
    });

    it('should throw validation errors for invalid data', async () => {
      await expect(itemService.updateItem(1, '', 10)).rejects.toEqual({
        errors: [{ field: 'name', message: 'Field "name" is required' }]
      });
      expect(mockItemRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteItem', () => {
    it('should return true when item is deleted successfully', async () => {
      mockItemRepository.delete.mockResolvedValue(true);

      const result = await itemService.deleteItem(1);

      expect(mockItemRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false when item does not exist', async () => {
      mockItemRepository.delete.mockResolvedValue(false);

      const result = await itemService.deleteItem(999);

      expect(mockItemRepository.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
}); 