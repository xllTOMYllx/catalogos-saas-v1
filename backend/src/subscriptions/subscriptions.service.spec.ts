import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './subscription.entity';
import { Client } from '../clients/client.entity';
import { Catalog } from '../catalogs/catalog.entity';
import { SubscriptionPlansService } from '../subscription-plans/subscription-plans.service';

describe('SubscriptionsService - Limits Validation', () => {
  let service: SubscriptionsService;
  let subscriptionRepository: Repository<Subscription>;
  let clientRepository: Repository<Client>;
  let catalogRepository: Repository<Catalog>;

  const mockSubscriptionPlan = {
    id: 1,
    name: 'FREE',
    price: 0,
    max_catalogs: 1,
    max_products_per_catalog: 20,
  };

  const mockSubscription = {
    id: 1,
    userId: 1,
    planId: 1,
    status: 'active',
    plan: mockSubscriptionPlan,
  };

  const mockSubscriptionPlansService = {
    findOne: jest.fn().mockResolvedValue(mockSubscriptionPlan),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: getRepositoryToken(Subscription),
          useValue: {
            findOne: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Client),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Catalog),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: SubscriptionPlansService,
          useValue: mockSubscriptionPlansService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    subscriptionRepository = module.get<Repository<Subscription>>(
      getRepositoryToken(Subscription),
    );
    clientRepository = module.get<Repository<Client>>(
      getRepositoryToken(Client),
    );
    catalogRepository = module.get<Repository<Catalog>>(
      getRepositoryToken(Catalog),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkLimits', () => {
    it('should return canCreateCatalog=true when under limit', async () => {
      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(mockSubscription as any);
      jest.spyOn(clientRepository, 'count').mockResolvedValue(0);

      const result = await service.checkLimits(1);

      expect(result.canCreateCatalog).toBe(true);
      expect(result.currentCatalogs).toBe(0);
      expect(result.maxCatalogs).toBe(1);
    });

    it('should return canCreateCatalog=false when at limit', async () => {
      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(mockSubscription as any);
      jest.spyOn(clientRepository, 'count').mockResolvedValue(1);

      const result = await service.checkLimits(1);

      expect(result.canCreateCatalog).toBe(false);
      expect(result.currentCatalogs).toBe(1);
      expect(result.maxCatalogs).toBe(1);
    });

    it('should return canCreateCatalog=true for unlimited plan', async () => {
      const unlimitedSubscription = {
        ...mockSubscription,
        plan: { ...mockSubscriptionPlan, max_catalogs: -1 },
      };
      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(unlimitedSubscription as any);
      jest.spyOn(clientRepository, 'count').mockResolvedValue(100);

      const result = await service.checkLimits(1);

      expect(result.canCreateCatalog).toBe(true);
      expect(result.maxCatalogs).toBe(-1);
    });

    it('should throw NotFoundException when subscription not found', async () => {
      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(null);

      await expect(service.checkLimits(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('canAddProductToCatalog', () => {
    it('should return canAdd=true when under product limit', async () => {
      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(mockSubscription as any);
      jest.spyOn(catalogRepository, 'count').mockResolvedValue(10);

      const result = await service.canAddProductToCatalog(1, 1);

      expect(result.canAdd).toBe(true);
      expect(result.currentProducts).toBe(10);
      expect(result.maxProducts).toBe(20);
    });

    it('should return canAdd=false when at product limit', async () => {
      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(mockSubscription as any);
      jest.spyOn(catalogRepository, 'count').mockResolvedValue(20);

      const result = await service.canAddProductToCatalog(1, 1);

      expect(result.canAdd).toBe(false);
      expect(result.currentProducts).toBe(20);
      expect(result.maxProducts).toBe(20);
      expect(result.reason).toContain('límite de 20 productos');
    });

    it('should return canAdd=true for unlimited products plan', async () => {
      const unlimitedSubscription = {
        ...mockSubscription,
        plan: { ...mockSubscriptionPlan, max_products_per_catalog: -1 },
      };
      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(unlimitedSubscription as any);
      jest.spyOn(catalogRepository, 'count').mockResolvedValue(1000);

      const result = await service.canAddProductToCatalog(1, 1);

      expect(result.canAdd).toBe(true);
      expect(result.maxProducts).toBe(-1);
    });
  });
});
