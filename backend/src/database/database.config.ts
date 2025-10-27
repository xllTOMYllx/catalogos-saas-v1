import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Client } from '../clients/client.entity';
import { Product } from '../products/product.entity';
import { Catalog } from '../catalogs/catalog.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'catalogos_saas',
  entities: [User, Client, Product, Catalog],
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev, use migrations in prod
  logging: process.env.NODE_ENV !== 'production',
};
