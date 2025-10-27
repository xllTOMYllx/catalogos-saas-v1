import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { Catalog } from './catalog.entity';

@Controller('api/catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get()
  async findAll(): Promise<Catalog[]> {
    return this.catalogsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Catalog | null> {
    return this.catalogsService.findOne(id);
  }

  @Get('client/:clientId')
  async findByClientId(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<Catalog[]> {
    return this.catalogsService.findByClientId(clientId);
  }

  @Post()
  async create(@Body() catalogData: Partial<Catalog>): Promise<Catalog> {
    return this.catalogsService.create(catalogData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updates: Partial<Catalog>,
  ): Promise<Catalog | null> {
    return this.catalogsService.update(id, updates);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const success = await this.catalogsService.delete(id);
    return { success };
  }
}
