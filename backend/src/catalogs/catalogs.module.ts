import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Catalog } from './catalog.entity';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Catalog]),
    SubscriptionsModule,
    ClientsModule,
  ],
  controllers: [CatalogsController],
  providers: [CatalogsService],
  exports: [CatalogsService],
})
export class CatalogsModule {}
