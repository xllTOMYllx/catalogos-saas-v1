import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Client } from '../clients/client.entity';
import { Subscription } from '../subscriptions/subscription.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string; // 'admin', 'client', 'user'

  @Column({ nullable: true })
  nombre: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Client, (client) => client.user)
  clients: Client[];

  @OneToOne(() => Subscription, (subscription) => subscription.user)
  subscription: Subscription;
}
