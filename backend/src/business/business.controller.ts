import { Controller, Get, Put, Body } from '@nestjs/common';
import { BusinessService } from './business.service';
import type { Business } from './business.entity';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  getBusiness(): Business {
    return this.businessService.getBusiness();
  }

  @Put()
  updateBusiness(@Body() updates: Partial<Business>): Business {
    return this.businessService.updateBusiness(updates);
  }
}
