import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
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

  async findByUserId(userId: number): Promise<Client[]> {
    return this.clientsRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async create(clientData: Partial<Client>): Promise<Client> {
    const client = this.clientsRepository.create(clientData);
    return this.clientsRepository.save(client);
  }

  async update(id: number, updates: Partial<Client>): Promise<Client | null> {
    // Remove fields that should not be updated to prevent issues
    const { id: _, createdAt, updatedAt, user, ...cleanUpdates } = updates as any;
    await this.clientsRepository.update(id, cleanUpdates);
    return this.findOne(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.clientsRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
