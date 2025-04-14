import { Request, ResponseToolkit } from '@hapi/hapi';
import { ItemService } from '../services/itemService';
import { ItemRepository } from '../repositories/itemRepository';
import { TestDataSource } from '../config/test-database';
import { AppDataSource } from '../config/database';

export class ItemHandler {
  private itemService: ItemService;

  constructor() {
    if (process.env.NODE_ENV === 'test') {
      const repository = new ItemRepository(TestDataSource);
      this.itemService = new ItemService(repository);
    } else {
      this.itemService = new ItemService();
    }
  }

  getAllItems = async (request: Request, h: ResponseToolkit) => {
    try {
      const items = await this.itemService.getAllItems();
      return h.response(items).code(200);
    } catch (error) {
      console.error('Error fetching items:', error);
      return h.response({ message: 'Internal server error' }).code(500);
    }
  };

  getItemById = async (request: Request, h: ResponseToolkit) => {
    try {
      const id = parseInt(request.params.id);
      const item = await this.itemService.getItemById(id);
      
      if (!item) {
        return h.response().code(404);
      }
      
      return h.response(item).code(200);
    } catch (error) {
      console.error('Error fetching item by id:', error);
      return h.response({ message: 'Internal server error' }).code(500);
    }
  };

  createItem = async (request: Request, h: ResponseToolkit) => {
    try {
      const { name, price } = request.payload as { name: string; price: number };
      const item = await this.itemService.createItem(name, price);
      return h.response(item).code(201);
    } catch (error: any) {
      if (error.errors) {
        return h.response(error).code(400);
      }
      
      console.error('Error creating item:', error);
      return h.response({ message: 'Internal server error' }).code(500);
    }
  };

  updateItem = async (request: Request, h: ResponseToolkit) => {
    try {
      const id = parseInt(request.params.id);
      const { name, price } = request.payload as { name: string; price: number };
      
      const updatedItem = await this.itemService.updateItem(id, name, price);
      
      if (!updatedItem) {
        return h.response().code(404);
      }
      
      return h.response(updatedItem).code(200);
    } catch (error: any) {
      if (error.errors) {
        return h.response(error).code(400);
      }
      
      console.error('Error updating item:', error);
      return h.response({ message: 'Internal server error' }).code(500);
    }
  };

  deleteItem = async (request: Request, h: ResponseToolkit) => {
    try {
      const id = parseInt(request.params.id);
      const deleted = await this.itemService.deleteItem(id);
      
      if (!deleted) {
        return h.response().code(404);
      }
      
      return h.response().code(204);
    } catch (error) {
      console.error('Error deleting item:', error);
      return h.response({ message: 'Internal server error' }).code(500);
    }
  };
} 