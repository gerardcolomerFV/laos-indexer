import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { TokenURIDataService } from './service/TokenURIDataService';
import * as dotenv from 'dotenv';
import { TokenUri, Metadata, LaosAsset } from '../model';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [TokenUri, Metadata, LaosAsset], 
});

export async function processTokenURIs() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const entityManager = AppDataSource.manager;
    const tokenURIDataService = TokenURIDataService.getInstance(entityManager);
    await tokenURIDataService.updatePendingTokenUris();
  } catch (error) {
    console.error('Error processing token URIs:', error);
  }
}



