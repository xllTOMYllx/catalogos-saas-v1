import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './client.entity';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(): Promise<Client[]> {
    return this.clientsService.findAll();
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Client> {
    const client = await this.clientsService.findBySlug(slug);
    if (!client) {
      throw new NotFoundException(`No se encontró el catálogo "${slug}"`);
    }
    return client;
  }

  @Get('public-store/:slug')
  async findPublicStore(@Param('slug') slug: string): Promise<Client> {
    const client = await this.clientsService.findPublicStore(slug);
    if (!client) {
      throw new NotFoundException(
        `La tienda "${slug}" no está disponible o no es pública`,
      );
    }
    return client;
  }

  @Get('check-slug/:slug')
  async checkSlugAvailability(
    @Param('slug') slug: string,
  ): Promise<{ available: boolean }> {
    return this.clientsService.checkSlugAvailability(slug);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Client | null> {
    return this.clientsService.findOne(id);
  }

  @Get('user/:userId')
  async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Client[]> {
    return this.clientsService.findByUserId(userId);
  }

  @Post()
  async create(@Body() clientData: Partial<Client>): Promise<Client> {
    return this.clientsService.create(clientData);
  }

  @Patch(':id/toggle-visibility')
  async toggleStoreVisibility(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ isStorePublic: boolean; slug: string }> {
    return this.clientsService.toggleStoreVisibility(id);
  }

  @Patch(':id/set-visibility')
  async setStoreVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isPublic: boolean },
  ): Promise<{ isStorePublic: boolean; slug: string }> {
    return this.clientsService.setStoreVisibility(id, body.isPublic);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updates: Partial<Client>,
  ): Promise<Client | null> {
    return this.clientsService.update(id, updates);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const success = await this.clientsService.delete(id);
    return { success };
  }
}
