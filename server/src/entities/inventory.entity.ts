import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  itemCode: string;

  @Column({ length: 200 })
  itemName: string;

  @Column({ length: 100, nullable: true })
  warehouse?: string;

  @Column({ length: 100, nullable: true })
  location?: string;

  @Column({ type: 'int', default: 0 })
  qty: number;

  @Column({ type: 'int', default: 0 })
  safetyQty: number;

  @Column({ length: 30, default: 'AVAILABLE' })
  status: string;

  @ManyToOne(() => Company, (c) => c.id, { nullable: true })
  company?: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
