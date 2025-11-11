import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './subscription.dto';
import { SubscriptionPlansService } from '../subscription-plans/subscription-plans.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private subscriptionPlansService: SubscriptionPlansService,
  ) {}

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      relations: ['plan', 'user'],
    });
  }

  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['plan', 'user'],
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async findByUserId(userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
      relations: ['plan'],
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription for user ${userId} not found`);
    }
    return subscription;
  }

  async create(createDto: CreateSubscriptionDto): Promise<Subscription> {
    // Validate plan exists
    await this.subscriptionPlansService.findOne(createDto.planId);

    // Check if user already has a subscription
    const existing = await this.subscriptionRepository.findOne({
      where: { userId: createDto.userId },
    });
    if (existing) {
      throw new BadRequestException('User already has an active subscription');
    }

    const subscription = this.subscriptionRepository.create(createDto);
    return this.subscriptionRepository.save(subscription);
  }

  async update(
    id: number,
    updateDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);

    // If changing plan, validate it exists
    if (updateDto.planId) {
      await this.subscriptionPlansService.findOne(updateDto.planId);
    }

    Object.assign(subscription, updateDto);
    return this.subscriptionRepository.save(subscription);
  }

  async changePlan(userId: number, planId: number): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    const newPlan = await this.subscriptionPlansService.findOne(planId);

    subscription.planId = newPlan.id;
    subscription.updatedAt = new Date();

    return this.subscriptionRepository.save(subscription);
  }

  async cancel(userId: number): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    subscription.status = 'cancelled';
    subscription.auto_renew = false;
    return this.subscriptionRepository.save(subscription);
  }

  async checkLimits(userId: number): Promise<{
    canCreateCatalog: boolean;
    canAddProduct: boolean;
    currentCatalogs: number;
    maxCatalogs: number;
    maxProducts: number;
  }> {
    const subscription = await this.findByUserId(userId);

    // For now, return mock data - would need to count actual catalogs
    return {
      canCreateCatalog: true,
      canAddProduct: true,
      currentCatalogs: 0,
      maxCatalogs: subscription.plan.max_catalogs,
      maxProducts: subscription.plan.max_products_per_catalog,
    };
  }

  async remove(id: number): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionRepository.remove(subscription);
  }
}
