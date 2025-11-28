import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
  ) {}

  async findAll(): Promise<ProductVariant[]> {
    return this.variantsRepository.find({
      relations: ['product'],
    });
  }

  async findOne(id: number): Promise<ProductVariant | null> {
    return this.variantsRepository.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  async findByProductId(productId: number): Promise<ProductVariant[]> {
    return this.variantsRepository.find({
      where: { productId, active: true },
      order: { variantType: 'ASC', variantValue: 'ASC' },
    });
  }

  async create(variant: Partial<ProductVariant>): Promise<ProductVariant> {
    const newVariant = this.variantsRepository.create(variant);
    return this.variantsRepository.save(newVariant);
  }

  async createMany(
    variants: Partial<ProductVariant>[],
  ): Promise<ProductVariant[]> {
    const newVariants = this.variantsRepository.create(variants);
    return this.variantsRepository.save(newVariants);
  }

  async update(
    id: number,
    updates: Partial<ProductVariant>,
  ): Promise<ProductVariant | null> {
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      product: _product,
      ...cleanUpdates
    } = updates as ProductVariant;
    await this.variantsRepository.update(id, cleanUpdates);
    return this.findOne(id);
  }

  async updateStock(
    id: number,
    stockChange: number,
  ): Promise<ProductVariant | null> {
    const variant = await this.findOne(id);
    if (!variant) return null;

    const newStock = Math.max(0, variant.stock + stockChange);
    await this.variantsRepository.update(id, { stock: newStock });
    return this.findOne(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.variantsRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByProductId(productId: number): Promise<boolean> {
    const result = await this.variantsRepository.delete({ productId });
    return (result.affected ?? 0) > 0;
  }
}
