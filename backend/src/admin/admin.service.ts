import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SubscriptionPlansService } from '../subscription-plans/subscription-plans.service';

export interface ClientWithDetails {
  id: number;
  email: string;
  nombre: string;
  isActive: boolean;
  createdAt: Date;
  client: {
    id: number;
    nombre: string;
    slug: string;
    logo: string;
  } | null;
  subscription: {
    id: number;
    status: string;
    planId: number;
    planName: string;
  } | null;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly clientsService: ClientsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscriptionPlansService: SubscriptionPlansService,
  ) {}

  async getAllClientsWithDetails(): Promise<ClientWithDetails[]> {
    const users = await this.usersService.findAllClients();
    const result: ClientWithDetails[] = [];

    for (const user of users) {
      // Get client data
      const clients = await this.clientsService.findByUserId(user.id);
      const client = clients.length > 0 ? clients[0] : null;

      // Get subscription data
      const subscription = await this.subscriptionsService.findByUserId(
        user.id,
      );

      result.push({
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        isActive: user.isActive,
        createdAt: user.createdAt,
        client: client
          ? {
              id: client.id,
              nombre: client.nombre,
              slug: client.slug,
              logo: client.logo,
            }
          : null,
        subscription: subscription
          ? {
              id: subscription.id,
              status: subscription.status,
              planId: subscription.planId,
              planName: subscription.plan?.name || 'Unknown',
            }
          : null,
      });
    }

    return result;
  }

  async toggleUserActiveStatus(
    userId: number,
  ): Promise<{ success: boolean; isActive: boolean }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const newStatus = !user.isActive;
    await this.usersService.setActiveStatus(userId, newStatus);

    return { success: true, isActive: newStatus };
  }

  async changeUserSubscription(
    userId: number,
    planId: number,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify plan exists
    const plan = await this.subscriptionPlansService.findOne(planId);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${planId} not found`);
    }

    // Check if user has an existing subscription
    const existingSubscription =
      await this.subscriptionsService.findByUserId(userId);

    if (existingSubscription) {
      // Update existing subscription
      await this.subscriptionsService.changePlan(userId, planId);
    } else {
      // Create new subscription
      await this.subscriptionsService.create({
        userId,
        planId,
        status: 'active',
        auto_renew: true,
      });
    }

    return {
      success: true,
      message: `Subscription changed to ${plan.name} successfully`,
    };
  }

  async getSubscriptionPlans() {
    return this.subscriptionPlansService.findAll();
  }

  async getDashboardStats(): Promise<{
    totalClients: number;
    activeClients: number;
    inactiveClients: number;
    totalSubscriptions: number;
  }> {
    const users = await this.usersService.findAllClients();
    const activeUsers = users.filter((u) => u.isActive);
    const inactiveUsers = users.filter((u) => !u.isActive);

    let totalSubscriptions = 0;
    for (const user of users) {
      const sub = await this.subscriptionsService.findByUserId(user.id);
      if (sub && sub.status === 'active') {
        totalSubscriptions++;
      }
    }

    return {
      totalClients: users.length,
      activeClients: activeUsers.length,
      inactiveClients: inactiveUsers.length,
      totalSubscriptions,
    };
  }
}
