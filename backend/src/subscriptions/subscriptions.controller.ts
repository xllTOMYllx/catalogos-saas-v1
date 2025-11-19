import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './subscription.dto';
import { Subscription } from './subscription.entity';

@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionsService.findOne(+id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Subscription> {
    return this.subscriptionsService.findByUserIdOrThrow(+userId);
  }

  @Get('user/:userId/limits')
  async checkLimits(@Param('userId') userId: string) {
    return this.subscriptionsService.checkLimits(+userId);
  }

  @Get('user/:userId/catalog/:catalogId/product-limits')
  async checkProductLimits(
    @Param('userId') userId: string,
    @Param('catalogId') catalogId: string,
  ) {
    return this.subscriptionsService.canAddProductToCatalog(
      +userId,
      +catalogId,
    );
  }

  @Post()
  async create(
    @Body() createDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    return this.subscriptionsService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    return this.subscriptionsService.update(+id, updateDto);
  }

  @Put('user/:userId/change-plan')
  async changePlan(
    @Param('userId') userId: string,
    @Body('planId') planId: number,
  ): Promise<Subscription> {
    return this.subscriptionsService.changePlan(+userId, planId);
  }

  @Put('user/:userId/cancel')
  async cancel(@Param('userId') userId: string): Promise<Subscription> {
    return this.subscriptionsService.cancel(+userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.subscriptionsService.remove(+id);
  }
}
