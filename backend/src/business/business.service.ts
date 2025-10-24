import { Injectable } from '@nestjs/common';
import { Business } from './business.entity';

@Injectable()
export class BusinessService {
  private business: Business = {
    nombre: 'UrbanStreet',
    logo: '/logosinfondo.png',
    color: '#f24427',
    telefono: '1234567890',
  };

  getBusiness(): Business {
    return this.business;
  }

  updateBusiness(updates: Partial<Business>): Business {
    this.business = { ...this.business, ...updates };
    return this.business;
  }
}
