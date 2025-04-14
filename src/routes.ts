import { Server, Request, ResponseToolkit } from "@hapi/hapi"
import { ItemHandler } from "./handlers/itemHandler"
import Joi from "joi"

export const defineRoutes = (server: Server) => {
    const itemSchema = Joi.object({
        id: Joi.number().required().description('The unique identifier for the item'),
        name: Joi.string().required().description('The name of the item'),
        price: Joi.number().required().description('The price of the item')
    }).label('Item');

    const itemPayloadSchema = Joi.object({
        name: Joi.string().required().messages({
            'any.required': 'Field "name" is required'
        }).description('The item name'),
        price: Joi.number().min(0).required().messages({
            'any.required': 'Field "price" is required',
            'number.min': 'Field "price" cannot be negative'
        }).description('The item price')
    }).label('Item Payload');


    const failAction = (request: Request, h: ResponseToolkit, err: Error | undefined) => {
        if (err && err instanceof Joi.ValidationError) {
            const errors = err.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return h.response({ errors }).code(400).takeover();
        }
        return h.continue;
    };

    // Health check route
    server.route({
        method: 'GET',
        path: '/ping',
        handler: async (request, h) => {
            return {
                ok: true
            }
        },
        options: {
            description: 'Health check endpoint',
            notes: 'Returns a simple message to confirm the API is running',
            tags: ['api', 'health'],
            response: {
                schema: Joi.object({
                    ok: Joi.boolean().required()
                }).label('HealthResponse')
            }
        }
    })

    const itemHandler = new ItemHandler()

    // GET all items
    server.route({
        method: 'GET',
        path: '/items',
        handler: itemHandler.getAllItems,
        options: {
            description: 'Get all items',
            notes: 'Returns a list of all items in the database',
            tags: ['api', 'items'],
            response: {
                schema: Joi.array().items(itemSchema)
            }
        }
    })

    // GET item by ID
    server.route({
        method: 'GET',
        path: '/items/{id}',
        handler: itemHandler.getItemById,
        options: {
            description: 'Get item by ID',
            notes: 'Returns a single item based on its ID',
            tags: ['api', 'items'],
            validate: {
                params: Joi.object({
                    id: Joi.number().required().description('The item ID')
                }),
                failAction
            },
            response: {
                schema: itemSchema
            }
        }
    })

    // POST new item
    server.route({
        method: 'POST',
        path: '/items',
        handler: itemHandler.createItem,
        options: {
            description: 'Create a new item',
            notes: 'Creates a new item with the provided name and price',
            tags: ['api', 'items'],
            validate: {
                payload: itemPayloadSchema,
                failAction
            },
            response: {
                schema: itemSchema
            }
        }
    })

    // PUT update item
    server.route({
        method: 'PUT',
        path: '/items/{id}',
        handler: itemHandler.updateItem,
        options: {
            description: 'Update an existing item',
            notes: 'Updates an item with the specified ID',
            tags: ['api', 'items'],
            validate: {
                params: Joi.object({
                    id: Joi.number().required().description('The item ID')
                }),
                payload: itemPayloadSchema,
                failAction
            },
            response: {
                schema: itemSchema
            }
        }
    })

    // DELETE item
    server.route({
        method: 'DELETE',
        path: '/items/{id}',
        handler: itemHandler.deleteItem,
        options: {
            description: 'Delete an item',
            notes: 'Deletes the item with the specified ID',
            tags: ['api', 'items'],
            validate: {
                params: Joi.object({
                    id: Joi.number().required().description('The item ID')
                }),
                failAction
            },
            response: {
                sample: 0,
                status: {
                    204: Joi.any().optional().description('Item successfully deleted')
                }
            }
        }
    })
}