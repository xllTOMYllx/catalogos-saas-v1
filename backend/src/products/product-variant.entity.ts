import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ length: 100 })
  variantType: string; // e.g., 'Talla', 'Color', 'Tamaño'

  @Column({ length: 255 })
  variantValue: string; // e.g., 'S', 'M', 'L', 'XL', 'Rojo', 'Azul'

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  additionalPrice: number; // Price adjustment for this variant

  @Column({ default: 0 })
  stock: number;

  @Column('text', { nullable: true })
  imageUrl: string | null; // Optional: specific image for this variant

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
