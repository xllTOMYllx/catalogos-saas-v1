import { Controller, Get, Put, Body } from '@nestjs/common';
import { BusinessService } from './business.service';
import type { Business } from './business.entity';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  async getBusiness(): Promise<Business> {
    return this.businessService.getBusiness();
  }

  @Put()
  async updateBusiness(@Body() updates: Partial<Business>): Promise<Business> {
    return this.businessService.updateBusiness(updates);
  }
}
