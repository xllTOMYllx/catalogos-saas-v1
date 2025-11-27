import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService, ClientWithDetails } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserData } from '../auth/current-user.decorator';

@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private validateAdmin(user: CurrentUserData): void {
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Only administrators can access this resource',
      );
    }
  }

  @Get('clients')
  async getAllClients(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ClientWithDetails[]> {
    this.validateAdmin(user);
    return this.adminService.getAllClientsWithDetails();
  }

  @Get('stats')
  async getDashboardStats(@CurrentUser() user: CurrentUserData) {
    this.validateAdmin(user);
    return this.adminService.getDashboardStats();
  }

  @Get('subscription-plans')
  async getSubscriptionPlans(@CurrentUser() user: CurrentUserData) {
    this.validateAdmin(user);
    return this.adminService.getSubscriptionPlans();
  }

  @Put('clients/:userId/toggle-status')
  async toggleUserStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    this.validateAdmin(user);
    return this.adminService.toggleUserActiveStatus(userId);
  }

  @Put('clients/:userId/change-subscription')
  async changeSubscription(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('planId', ParseIntPipe) planId: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    this.validateAdmin(user);
    return this.adminService.changeUserSubscription(userId, planId);
  }
}
