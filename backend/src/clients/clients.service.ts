import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async findAll(): Promise<Client[]> {
    return this.clientsRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Client | null> {
    return this.clientsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findBySlug(slug: string): Promise<Client | null> {
    return this.clientsRepository.findOne({
      where: { slug },
      relations: ['user'],
    });
  }

  /**
   * Find a public store by slug
   * Only returns the client if isStorePublic is true
   */
  async findPublicStore(slug: string): Promise<Client | null> {
    return this.clientsRepository.findOne({
      where: { slug, isStorePublic: true },
      relations: ['user'],
    });
  }

  /**
   * Toggle the public visibility of a client's store
   */
  async toggleStoreVisibility(
    id: number,
  ): Promise<{ isStorePublic: boolean; slug: string }> {
    const client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    const newVisibility = !client.isStorePublic;
    await this.clientsRepository.update(id, { isStorePublic: newVisibility });

    return {
      isStorePublic: newVisibility,
      slug: client.slug,
    };
  }

  /**
   * Set the public visibility of a client's store
   */
  async setStoreVisibility(
    id: number,
    isPublic: boolean,
  ): Promise<{ isStorePublic: boolean; slug: string }> {
    const client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    await this.clientsRepository.update(id, { isStorePublic: isPublic });

    return {
      isStorePublic: isPublic,
      slug: client.slug,
    };
  }

  async checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
    const existing = await this.clientsRepository.findOne({
      where: { slug },
    });
    return { available: !existing };
  }

  async findByUserId(userId: number): Promise<Client[]> {
    return this.clientsRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async create(clientData: Partial<Client>): Promise<Client> {
    // Validate subscription limits if userId is provided
    if (clientData.userId) {
      const limits = await this.subscriptionsService.checkLimits(
        clientData.userId,
      );

      if (!limits.canCreateCatalog) {
        const maxCatalogs =
          limits.maxCatalogs === -1 ? 'ilimitados' : limits.maxCatalogs;
        throw new ForbiddenException(
          `Has alcanzado el límite de ${maxCatalogs} catálogos de tu plan actual (tienes ${limits.currentCatalogs}). Actualiza tu plan para crear más catálogos.`,
        );
      }
    }

    // Validate slug uniqueness if provided
    if (clientData.slug) {
      const existingSlug = await this.findBySlug(clientData.slug);
      if (existingSlug) {
        throw new ConflictException(
          `El slug "${clientData.slug}" ya está en uso. Por favor, elige otro.`,
        );
      }
    }

    const client = this.clientsRepository.create(clientData);
    return this.clientsRepository.save(client);
  }

  async update(id: number, updates: Partial<Client>): Promise<Client | null> {
    // If updating slug, validate uniqueness
    if (updates.slug) {
      const existingSlug = await this.findBySlug(updates.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException(
          `El slug "${updates.slug}" ya está en uso. Por favor, elige otro.`,
        );
      }
    }

    // Remove fields that should not be updated to prevent issues
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {
      id: _,
      createdAt,
      updatedAt,
      user,
      ...cleanUpdates
    } = updates as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.clientsRepository.update(id, cleanUpdates);
    return this.findOne(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.clientsRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
