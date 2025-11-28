import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { UploadModule } from './upload/upload.module';
import { SubscriptionPlansModule } from './subscription-plans/subscription-plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AdminModule } from './admin/admin.module';
import { User } from './users/user.entity';
import { Client } from './clients/client.entity';
import { Product } from './products/product.entity';
import { ProductVariant } from './products/product-variant.entity';
import { Catalog } from './catalogs/catalog.entity';
import { Subscription } from './subscriptions/subscription.entity';
import { SubscriptionPlan } from './subscription-plans/subscription-plan.entity';
import { PasswordResetToken } from './auth/password-reset-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME', 'catalogos_saas'),
        entities: [
          User,
          Client,
          Product,
          ProductVariant,
          Catalog,
          Subscription,
          SubscriptionPlan,
          PasswordResetToken,
        ],
        synchronize: false,
        logging:
          configService.get('NODE_ENV') !== 'production' ? ['error'] : false,
      }),
    }),
    ProductsModule,
    AuthModule,
    BusinessModule,
    UsersModule,
    ClientsModule,
    CatalogsModule,
    UploadModule,
    SubscriptionPlansModule,
    SubscriptionsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
