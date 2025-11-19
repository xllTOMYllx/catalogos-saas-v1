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
import { Client } from '../clients/client.entity';
import { Catalog } from '../catalogs/catalog.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Catalog)
    private catalogRepository: Repository<Catalog>,
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

  async findByUserId(userId: number): Promise<Subscription | null> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
      relations: ['plan'],
    });
    return subscription;
  }

  async findByUserIdOrThrow(userId: number): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
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
    const subscription = await this.findByUserIdOrThrow(userId);
    const newPlan = await this.subscriptionPlansService.findOne(planId);

    subscription.planId = newPlan.id;
    subscription.updatedAt = new Date();

    return this.subscriptionRepository.save(subscription);
  }

  async cancel(userId: number): Promise<Subscription> {
    const subscription = await this.findByUserIdOrThrow(userId);
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

    // If no subscription exists, provide default FREE plan limits
    let maxCatalogs = 1;
    let maxProducts = 20;
    
    if (subscription && subscription.plan) {
      maxCatalogs = subscription.plan.max_catalogs;
      maxProducts = subscription.plan.max_products_per_catalog;
    }

    // Count actual catalogs (clients) for this user
    const currentCatalogs = await this.clientRepository.count({
      where: { userId },
    });

    // -1 means unlimited
    const canCreateCatalog =
      maxCatalogs === -1 || currentCatalogs < maxCatalogs;

    // For products, we assume they can add if not at catalog limit
    // More granular product checks can be done per catalog
    const canAddProduct = true; // Will be checked per catalog

    return {
      canCreateCatalog,
      canAddProduct,
      currentCatalogs,
      maxCatalogs,
      maxProducts,
    };
  }

  /**
   * Check if a user can add a product to a specific catalog
   */
  async canAddProductToCatalog(
    userId: number,
    clientId: number,
  ): Promise<{
    canAdd: boolean;
    currentProducts: number;
    maxProducts: number;
    reason?: string;
  }> {
    const subscription = await this.findByUserId(userId);

    // Default to FREE plan limits if no subscription
    let maxProducts = 20;
    let planName = 'FREE';
    
    if (subscription && subscription.plan) {
      maxProducts = subscription.plan.max_products_per_catalog;
      planName = subscription.plan.name;
    }

    // Count products in this catalog
    const currentProducts = await this.catalogRepository.count({
      where: { clientId },
    });

    // -1 means unlimited
    const canAdd = maxProducts === -1 || currentProducts < maxProducts;

    let reason: string | undefined;
    if (!canAdd) {
      reason = `Has alcanzado el límite de ${maxProducts} productos por catálogo de tu plan ${planName}. Actualiza tu plan para agregar más productos.`;
    }

    return {
      canAdd,
      currentProducts,
      maxProducts,
      reason,
    };
  }

  async remove(id: number): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionRepository.remove(subscription);
  }
}
