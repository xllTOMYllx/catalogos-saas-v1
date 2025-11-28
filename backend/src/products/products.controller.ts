import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import type { Product } from './product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('includeVariants') includeVariants?: string,
  ): Promise<Product[]> {
    if (includeVariants === 'true') {
      return this.productsService.findAllWithVariants();
    }
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('includeVariants') includeVariants?: string,
  ): Promise<Product | null> {
    if (includeVariants === 'true') {
      return this.productsService.findOneWithVariants(+id);
    }
    return this.productsService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() product: Partial<Product>): Promise<Product> {
    return this.productsService.create(product);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updates: Partial<Product>,
  ): Promise<Product | null> {
    return this.productsService.update(+id, updates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.productsService.delete(+id);
  }
}
