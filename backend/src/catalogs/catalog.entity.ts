import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Product } from '../products/product.entity';

@Entity('catalogs')
export class Catalog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, (client) => client.catalogs)
  client: Client;

  @Column()
  clientId: number;

  @ManyToOne(() => Product, (product) => product.catalogs)
  product: Product;

  @Column()
  productId: number;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  customPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
