import { DataSource } from 'typeorm';
import { Item } from '../models/item';
import dotenv from 'dotenv';
import { Client, Pool } from 'pg';

dotenv.config();

const pgPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'eldorado',
  max: 20,
  idleTimeoutMillis: 30000
});

pgPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'eldorado',
  entities: [Item],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: 'postgres',
    });

    await client.connect();
    
    const dbName = process.env.DB_DATABASE || 'eldorado';
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname='${dbName}'`
    );
    
    if (result.rows.length === 0) {
      console.log(`Database ${dbName} does not exist, creating...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
    
    await client.end();
    
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

export const cleanupDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    
    await pgPool.end();
    
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}; 