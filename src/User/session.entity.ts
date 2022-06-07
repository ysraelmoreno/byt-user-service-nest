import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('session')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId?: string;

  @ManyToOne(() => User, (user: User) => user.id)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user?: User;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
