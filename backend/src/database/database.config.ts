import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Client } from '../clients/client.entity';
import { Product } from '../products/product.entity';
import { Catalog } from '../catalogs/catalog.entity';
import { Subscription } from '../subscriptions/subscription.entity';
import { SubscriptionPlan } from '../subscription-plans/subscription-plan.entity';

/**
 * Database configuration for TypeORM
 * SECURITY: DB credentials must be provided via environment variables
 * No default values are provided for DB_USERNAME and DB_PASSWORD to prevent
 * accidental exposure of credentials in version control
 */
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'catalogos_saas',
  entities: [User, Client, Product, Catalog, Subscription, SubscriptionPlan],
  synchronize: false, // Disable auto-sync to use existing database schema
  logging: process.env.NODE_ENV !== 'production' ? ['error'] : false,
};
