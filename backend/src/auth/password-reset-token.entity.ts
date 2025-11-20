import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  // Alineamos con la columna real en la BD (userid en minúsculas)
  @Column({ name: 'userid' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userid' })
  user: User;

  // Mapear al nombre real en la BD (expiresAt → expiresat)
  @Column({ name: 'expiresat', type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  // Mapear createdAt → createdat
  @CreateDateColumn({ name: 'createdat' })
  createdAt: Date;
}