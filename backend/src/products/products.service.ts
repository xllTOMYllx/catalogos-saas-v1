import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productsRepository.findOne({ where: { id } });
  }

  async create(product: Partial<Product>): Promise<Product> {
    const newProduct = this.productsRepository.create(product);
    return this.productsRepository.save(newProduct);
  }

  async update(id: number, updates: Partial<Product>): Promise<Product | null> {
    // Remove fields that should not be updated to prevent issues
    const { id: _, createdAt, updatedAt, catalogs, ...cleanUpdates } = updates as any;
    await this.productsRepository.update(id, cleanUpdates);
    return this.findOne(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.productsRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
