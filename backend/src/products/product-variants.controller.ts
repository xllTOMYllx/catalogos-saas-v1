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
} from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import type { ProductVariant } from './product-variant.entity';

@Controller('product-variants')
export class ProductVariantsController {
  constructor(private readonly variantsService: ProductVariantsService) {}

  @Get()
  async findAll(): Promise<ProductVariant[]> {
    return this.variantsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductVariant | null> {
    return this.variantsService.findOne(+id);
  }

  @Get('product/:productId')
  async findByProductId(
    @Param('productId') productId: string,
  ): Promise<ProductVariant[]> {
    return this.variantsService.findByProductId(+productId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() variant: Partial<ProductVariant>,
  ): Promise<ProductVariant> {
    return this.variantsService.create(variant);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async createMany(
    @Body() variants: Partial<ProductVariant>[],
  ): Promise<ProductVariant[]> {
    return this.variantsService.createMany(variants);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updates: Partial<ProductVariant>,
  ): Promise<ProductVariant | null> {
    return this.variantsService.update(+id, updates);
  }

  @Put(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body('stockChange') stockChange: number,
  ): Promise<ProductVariant | null> {
    return this.variantsService.updateStock(+id, stockChange);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.variantsService.delete(+id);
  }
}
