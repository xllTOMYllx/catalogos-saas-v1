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
import { SubscriptionPlansService } from './subscription-plans.service';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
} from './subscription-plan.dto';
import { SubscriptionPlan } from './subscription-plan.entity';

@Controller('api/subscription-plans')
export class SubscriptionPlansController {
  constructor(
    private readonly subscriptionPlansService: SubscriptionPlansService,
  ) {}

  @Get()
  async findAll(): Promise<SubscriptionPlan[]> {
    return this.subscriptionPlansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SubscriptionPlan> {
    return this.subscriptionPlansService.findOne(+id);
  }

  @Post()
  async create(
    @Body() createDto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    return this.subscriptionPlansService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    return this.subscriptionPlansService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.subscriptionPlansService.remove(+id);
  }
}
