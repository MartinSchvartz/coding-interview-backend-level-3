import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ItemHandler } from '../itemHandler';
import { ItemService } from '../../services/itemService';
import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi';

jest.mock('../../services/itemService');

const MockItemService = ItemService as jest.MockedClass<typeof ItemService>;

describe('ItemHandler', () => {
  let itemHandler: ItemHandler;
  let mockRequest: Partial<Request>;
  let mockH: Partial<ResponseToolkit>;
  let mockResponse: Partial<ResponseObject>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockResponse = {
      code: jest.fn().mockReturnThis(),
    } as unknown as Partial<ResponseObject>;
    
    mockH = {
      response: jest.fn().mockReturnValue(mockResponse as ResponseObject),
    } as unknown as Partial<ResponseToolkit>;
    
    MockItemService.prototype.getAllItems = jest.fn();
    MockItemService.prototype.getItemById = jest.fn();
    MockItemService.prototype.createItem = jest.fn();
    MockItemService.prototype.updateItem = jest.fn();
    MockItemService.prototype.deleteItem = jest.fn();
    
    itemHandler = new ItemHandler();
  });

  describe('getAllItems', () => {
    it('should return status 200 with items when successful', async () => {
      const mockItems = [
        { id: 1, name: 'Item 1', price: 10 },
        { id: 2, name: 'Item 2', price: 20 }
      ];
      MockItemService.prototype.getAllItems.mockResolvedValue(mockItems);
      mockRequest = {};

      await itemHandler.getAllItems(mockRequest as Request, mockH as ResponseToolkit);

      expect(MockItemService.prototype.getAllItems).toHaveBeenCalledTimes(1);
      expect(mockH.response).toHaveBeenCalledWith(mockItems);
      expect(mockResponse.code).toHaveBeenCalledWith(200);
    });

    it('should return status 500 when service throws an error', async () => {
      const error = new Error('Database error');
      MockItemService.prototype.getAllItems.mockRejectedValue(error);
      mockRequest = {};

      jest.spyOn(console, 'error').mockImplementation(() => {});

      await itemHandler.getAllItems(mockRequest as Request, mockH as ResponseToolkit);

      expect(MockItemService.prototype.getAllItems).toHaveBeenCalledTimes(1);
      expect(mockH.response).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(mockResponse.code).toHaveBeenCalledWith(500);
      expect(console.error).toHaveBeenCalledWith('Error fetching items:', error);
    });
  });

  describe('getItemById', () => {
    it('should return status 200 with item when item exists', async () => {
      const mockItem = { id: 1, name: 'Test Item', price: 15 };
      MockItemService.prototype.getItemById.mockResolvedValue(mockItem);
      mockRequest = {
        params: { id: '1' }
      };

      await itemHandler.getItemById(mockRequest as Request, mockH as ResponseToolkit);

      expect(MockItemService.prototype.getItemById).toHaveBeenCalledWith(1);
      expect(mockH.response).toHaveBeenCalledWith(mockItem);
      expect(mockResponse.code).toHaveBeenCalledWith(200);
    });

    it('should return status 404 when item does not exist', async () => {

      MockItemService.prototype.getItemById.mockResolvedValue(null);
      mockRequest = {
        params: { id: '999' }
      };

      await itemHandler.getItemById(mockRequest as Request, mockH as ResponseToolkit);

      expect(MockItemService.prototype.getItemById).toHaveBeenCalledWith(999);
      expect(mockH.response).toHaveBeenCalled();
      expect(mockResponse.code).toHaveBeenCalledWith(404);
    });

    it('should return status 500 when service throws an error', async () => {
      const error = new Error('Database error');
      MockItemService.prototype.getItemById.mockRejectedValue(error);
      mockRequest = {
        params: { id: '1' }
      };

      jest.spyOn(console, 'error').mockImplementation(() => {});

      await itemHandler.getItemById(mockRequest as Request, mockH as ResponseToolkit);

      expect(mockH.response).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(mockResponse.code).toHaveBeenCalledWith(500);
    });
  });

  describe('createItem', () => {
    it('should return status 201 with created item when successful', async () => {

      const payload = { name: 'New Item', price: 25 };
      const createdItem = { id: 1, ...payload };
      MockItemService.prototype.createItem.mockResolvedValue(createdItem);
      mockRequest = {
        payload
      };

      await itemHandler.createItem(mockRequest as Request, mockH as ResponseToolkit);

      expect(MockItemService.prototype.createItem).toHaveBeenCalledWith('New Item', 25);
      expect(mockH.response).toHaveBeenCalledWith(createdItem);
      expect(mockResponse.code).toHaveBeenCalledWith(201);
    });

    it('should return status 400 with validation errors when validation fails', async () => {

      const payload = { name: '', price: -10 };
      const validationErrors = {
        errors: [
          { field: 'name', message: 'Field "name" is required' },
          { field: 'price', message: 'Field "price" cannot be negative' }
        ]
      };
      MockItemService.prototype.createItem.mockRejectedValue(validationErrors);
      mockRequest = {
        payload
      };

      await itemHandler.createItem(mockRequest as Request, mockH as ResponseToolkit);

      expect(mockH.response).toHaveBeenCalledWith(validationErrors);
      expect(mockResponse.code).toHaveBeenCalledWith(400);
    });

    it('should return status 500 when service throws a non-validation error', async () => {
      const payload = { name: 'Test', price: 30 };
      const error = new Error('Database error');
      MockItemService.prototype.createItem.mockRejectedValue(error);
      mockRequest = {
        payload
      };

      jest.spyOn(console, 'error').mockImplementation(() => {});

      await itemHandler.createItem(mockRequest as Request, mockH as ResponseToolkit);

      expect(mockH.response).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(mockResponse.code).toHaveBeenCalledWith(500);
    });
  });

  describe('updateItem', () => {
    it('should return status 200 with updated item when successful', async () => {

      const id = '1';
      const payload = { name: 'Updated Item', price: 35 };
      const updatedItem = { id: 1, ...payload };
      MockItemService.prototype.updateItem.mockResolvedValue(updatedItem);
      mockRequest = {
        params: { id },
        payload
      };

      await itemHandler.updateItem(mockRequest as Request, mockH as ResponseToolkit);

      expect(MockItemService.prototype.updateItem).toHaveBeenCalledWith(1, 'Updated Item', 35);
      expect(mockH.response).toHaveBeenCalledWith(updatedItem);
      expect(mockResponse.code).toHaveBeenCalledWith(200);
    });

    it('should return status 404 when item does not exist', async () => {
      const id = '999';
      const payload = { name: 'Test Item', price: 40 };
      MockItemService.prototype.updateItem.mockResolvedValue(null);
      mockRequest = {
        params: { id },
        payload
      };

      await itemHandler.updateItem(mockRequest as Request, mockH as ResponseToolkit);

      expect(mockH.response).toHaveBeenCalled();
      expect(mockResponse.code).toHaveBeenCalledWith(404);
    });

    it('should return status 400 with validation errors when validation fails', async () => {
      const id = '1';
      const payload = { name: '', price: -5 };
      const validationErrors = {
        errors: [
          { field: 'name', message: 'Field "name" is required' },
          { field: 'price', message: 'Field "price" cannot be negative' }
        ]
      };
      MockItemService.prototype.updateItem.mockRejectedValue(validationErrors);
      mockRequest = {
        params: { id },
        payload
      };

      await itemHandler.updateItem(mockRequest as Request, mockH as ResponseToolkit);

      expect(mockH.response).toHaveBeenCalledWith(validationErrors);
      expect(mockResponse.code).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteItem', () => {
    it('should return status 204 when item is deleted successfully', async () => {
      const id = '1';
      MockItemService.prototype.deleteItem.mockResolvedValue(true);
      mockRequest = {
        params: { id }
      };

      await itemHandler.deleteItem(mockRequest as Request, mockH as ResponseToolkit);

      expect(MockItemService.prototype.deleteItem).toHaveBeenCalledWith(1);
      expect(mockH.response).toHaveBeenCalled();
      expect(mockResponse.code).toHaveBeenCalledWith(204);
    });

    it('should return status 404 when item does not exist', async () => {
      const id = '999';
      MockItemService.prototype.deleteItem.mockResolvedValue(false);
      mockRequest = {
        params: { id }
      };

      await itemHandler.deleteItem(mockRequest as Request, mockH as ResponseToolkit);

      expect(mockH.response).toHaveBeenCalled();
      expect(mockResponse.code).toHaveBeenCalledWith(404);
    });

    it('should return status 500 when service throws an error', async () => {
      const id = '1';
      const error = new Error('Database error');
      MockItemService.prototype.deleteItem.mockRejectedValue(error);
      mockRequest = {
        params: { id }
      };

      jest.spyOn(console, 'error').mockImplementation(() => {});

      await itemHandler.deleteItem(mockRequest as Request, mockH as ResponseToolkit);

      expect(mockH.response).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(mockResponse.code).toHaveBeenCalledWith(500);
    });
  });
}); 