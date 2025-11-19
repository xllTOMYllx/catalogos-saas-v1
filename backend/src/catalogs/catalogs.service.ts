import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from './catalog.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(Catalog)
    private catalogsRepository: Repository<Catalog>,
    private subscriptionsService: SubscriptionsService,
    private clientsService: ClientsService,
  ) {}

  async findAll(): Promise<Catalog[]> {
    return this.catalogsRepository.find({
      relations: ['client', 'product'],
    });
  }

  async findOne(id: number): Promise<Catalog | null> {
    return this.catalogsRepository.findOne({
      where: { id },
      relations: ['client', 'product'],
    });
  }

  async findByClientId(clientId: number): Promise<Catalog[]> {
    return this.catalogsRepository.find({
      where: { clientId },
      relations: ['client', 'product'],
    });
  }

  async create(catalogData: Partial<Catalog>): Promise<Catalog> {
    // Validate product limits if clientId is provided
    if (catalogData.clientId) {
      // Get the client to find the userId
      const client = await this.clientsService.findOne(catalogData.clientId);
      
      if (client?.userId) {
        const productCheck = await this.subscriptionsService.canAddProductToCatalog(
          client.userId,
          catalogData.clientId,
        );

        if (!productCheck.canAdd) {
          throw new ForbiddenException(
            productCheck.reason || 'Has alcanzado el límite de productos para este catálogo. Actualiza tu plan para agregar más productos.',
          );
        }
      }
    }

    const catalog = this.catalogsRepository.create(catalogData);
    return this.catalogsRepository.save(catalog);
  }

  async update(id: number, updates: Partial<Catalog>): Promise<Catalog | null> {
    // Remove fields that should not be updated to prevent issues
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {
      id: _,
      createdAt,
      updatedAt,
      client,
      product,
      ...cleanUpdates
    } = updates as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.catalogsRepository.update(id, cleanUpdates);
    return this.findOne(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.catalogsRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
