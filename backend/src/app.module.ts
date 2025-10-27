import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { typeOrmConfig } from './database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    ProductsModule,
    AuthModule,
    BusinessModule,
    UsersModule,
    ClientsModule,
    CatalogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
