import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Client, Pool } from 'pg';
import { Item } from '../models/item';

dotenv.config();

const testPgPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.TEST_DB_DATABASE || 'eldorado_test',
  max: 20,
  idleTimeoutMillis: 30000
});

testPgPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const TestDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.TEST_DB_DATABASE || 'eldorado_test',
  synchronize: true,
  logging: false,
  entities: [Item],
  dropSchema: true
});

export const initializeTestDatabase = async (): Promise<void> => {
  try {
    if (TestDataSource.isInitialized) {
      await TestDataSource.synchronize(true);
      return;
    }
    
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: 'postgres',
    });

    await client.connect();
    
    const dbName = process.env.TEST_DB_DATABASE || 'eldorado_test';
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname='${dbName}'`
    );
    
    if (result.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
    }
    
    await client.end();
    
    await TestDataSource.initialize();
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
};

export const cleanupTestDatabase = async (): Promise<void> => {
  try {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
    }
    
    await testPgPool.end();
  } catch (error) {
    console.error('Error closing test database connections:', error);
  }
}; 