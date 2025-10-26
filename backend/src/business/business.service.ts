import { Injectable } from '@nestjs/common';
import { Business } from './business.entity';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class BusinessService {
  // Default business ID for backward compatibility
  private defaultBusinessId = 1;

  constructor(private readonly clientsService: ClientsService) {}

  async getBusiness(): Promise<Business> {
    const client = await this.clientsService.findOne(this.defaultBusinessId);
    if (client) {
      return {
        nombre: client.nombre,
        logo: client.logo,
        color: client.color,
        telefono: client.telefono,
      };
    }
    // Return default if not found
    return {
      nombre: 'UrbanStreet',
      logo: '/logosinfondo.png',
      color: '#f24427',
      telefono: '1234567890',
    };
  }

  async updateBusiness(updates: Partial<Business>): Promise<Business> {
    const client = await this.clientsService.findOne(this.defaultBusinessId);
    if (client) {
      await this.clientsService.update(this.defaultBusinessId, updates);
    }
    return this.getBusiness();
  }
}
