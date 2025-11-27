import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { SubscriptionPlansModule } from '../subscription-plans/subscription-plans.module';

@Module({
  imports: [
    UsersModule,
    ClientsModule,
    SubscriptionsModule,
    SubscriptionPlansModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
