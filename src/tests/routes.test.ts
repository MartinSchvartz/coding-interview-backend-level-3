import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Server } from '@hapi/hapi';
import { defineRoutes } from '../routes';
import * as Hapi from '@hapi/hapi';
import Joi from 'joi';

jest.mock('../handlers/itemHandler', () => {
  return {
    ItemHandler: jest.fn().mockImplementation(() => ({
      getAllItems: jest.fn(),
      getItemById: jest.fn(),
      createItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn()
    }))
  };
});

describe('Routes Configuration', () => {
  let server: Server;
  
  beforeEach(async () => {
    server = Hapi.server({
      port: 0,
      host: 'localhost'
    });
    
    defineRoutes(server);
  });
  
  afterEach(async () => {
    await server.stop();
  });
  
  describe('Route Definition', () => {
    it('should define all required routes', () => {
      const routes = server.table();
      const paths = routes.map(route => ({
        path: route.path,
        method: route.method
      }));
      
      expect(paths).toEqual(
        expect.arrayContaining([
          { path: '/ping', method: 'get' },
          { path: '/items', method: 'get' },
          { path: '/items/{id}', method: 'get' },
          { path: '/items', method: 'post' },
          { path: '/items/{id}', method: 'put' },
          { path: '/items/{id}', method: 'delete' }
        ])
      );
    });
  });
  
  describe('Route Validation', () => {
    it('should include validation for item payload on POST route', () => {
      const postRoute = server.table().find(
        route => route.path === '/items' && route.method === 'post'
      );
      
      expect(postRoute).toBeDefined();
      expect(postRoute?.settings.validate?.payload).toBeDefined();
    });
    
    it('should include validation for item payload on PUT route', () => {
      const putRoute = server.table().find(
        route => route.path === '/items/{id}' && route.method === 'put'
      );
      
      expect(putRoute).toBeDefined();
      expect(putRoute?.settings.validate?.payload).toBeDefined();
    });
    
    it('should include ID parameter validation for item routes', () => {
      const getByIdRoute = server.table().find(
        route => route.path === '/items/{id}' && route.method === 'get'
      );
      
      expect(getByIdRoute).toBeDefined();
      expect(getByIdRoute?.settings.validate?.params).toBeDefined();
    });
  });
  
  describe('Error Handling', () => {
    it('should include failAction for validation errors', () => {
      const postRoute = server.table().find(
        route => route.path === '/items' && route.method === 'post'
      );
      
      expect(postRoute?.settings.validate?.failAction).toBeDefined();
    });
    
    it('should transform Joi validation errors to customized format', async () => {
      const testServer = Hapi.server();
      defineRoutes(testServer);
      await testServer.initialize();
      
      const response = await testServer.inject({
        method: 'POST',
        url: '/items',
        payload: { price: 10 }
      });
      
      expect(response.statusCode).toBe(400);
      
      const payload = JSON.parse(response.payload);
      expect(payload.errors).toBeDefined();
      expect(Array.isArray(payload.errors)).toBe(true);
      
      const errorMessages = payload.errors.map((err: any) => err.message);
      expect(errorMessages).toEqual(
        expect.arrayContaining([
          expect.stringContaining('required')
        ])
      );
      
      const negativeResponse = await testServer.inject({
        method: 'POST',
        url: '/items',
        payload: { name: 'Test Item', price: -5 }
      });
      
      expect(negativeResponse.statusCode).toBe(400);
      
      const negativePayload = JSON.parse(negativeResponse.payload);
      expect(negativePayload.errors).toBeDefined();
      
      const negativeErrorMessages = negativePayload.errors.map((err: any) => err.message);
      expect(negativeErrorMessages).toEqual(
        expect.arrayContaining([
          expect.stringContaining('cannot be negative')
        ])
      );
    });
  });
  
  describe('Response Schemas', () => {
    it('should define response schemas for all routes', () => {
      const routes = server.table();
      
      for (const route of routes) {
        if (route.path.startsWith('/items')) {
          expect(route.settings.response).toBeDefined();
        }
      }
    });
    
    it('should define a 204 response for DELETE route', () => {
      const deleteRoute = server.table().find(
        route => route.path === '/items/{id}' && route.method === 'delete'
      );
      
      expect(deleteRoute?.settings.response?.status?.[204]).toBeDefined();
    });
  });
}); 