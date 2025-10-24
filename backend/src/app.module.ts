import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';

@Module({
  imports: [ProductsModule, AuthModule, BusinessModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
