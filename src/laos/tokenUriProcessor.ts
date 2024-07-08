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

async function main() {
  try {
    await AppDataSource.initialize();
    const entityManager = AppDataSource.manager;
    const tokenURIDataService = TokenURIDataService.getInstance(entityManager);

    async function updateService() {
      console.log('Updating pending token URIs ****************************************');
      await tokenURIDataService.updatePendingTokenUris();
    }

    updateService(); // Initial call
    setInterval(updateService, 15 * 60 * 1000); // Every 15 minutes

    console.log('TokenURIDataService will run every 15 minutes.');
  } catch (error) {
    console.error('Error establishing database connection:', error);
  }
}


main();
