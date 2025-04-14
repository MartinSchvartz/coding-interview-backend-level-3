import Hapi from '@hapi/hapi'
import { defineRoutes } from './routes'
import { initializeDatabase, AppDataSource, cleanupDatabase } from './config/database'
import { initializeTestDatabase, TestDataSource, cleanupTestDatabase } from './config/test-database'
import 'reflect-metadata'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import HapiSwagger from 'hapi-swagger'

const getServer = () => {
    const server = Hapi.server({
        host: 'localhost',
        port: 3000,
    })

    server.ext('onPostStop', async (server) => {
        if (process.env.NODE_ENV === 'test') {
            await cleanupTestDatabase();
        } else {
            await cleanupDatabase();
        }
    });

    return server
}

export const initializeServer = async () => {
    if (process.env.NODE_ENV === 'test') {
        await initializeTestDatabase()
    } else {
        await initializeDatabase()
    }
    
    const server = getServer()
    
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'Items API Documentation',
                    version: '1.0.0',
                    description: 'API for managing items'
                },
                documentationPath: '/docs',
                schemes: ['http'],
                securityDefinitions: {
                    jwt: {
                        type: 'apiKey',
                        name: 'Authorization',
                        in: 'header'
                    }
                },
                security: [{ jwt: [] }],
                grouping: 'tags'
            }
        }
    ]);
    
    defineRoutes(server)
    
    await server.initialize()
    return server
}

export const startServer = async () => {
    await initializeDatabase()
    const server = getServer()

    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'Items API Documentation',
                    version: '1.0.0',
                    description: 'API for managing items'
                },
                documentationPath: '/docs',
                schemes: ['http']
            }
        }
    ]);
    
    defineRoutes(server)
    
    await server.start()
    console.log(`Server running on ${server.info.uri}`)
    console.log(`Documentation available at ${server.info.uri}/docs`)
    return server
};