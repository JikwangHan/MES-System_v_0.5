import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { WorkOperation } from './work-operation.entity';
import { ProductionResult } from './production-result.entity';

@Entity('work_order')
export class WorkOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.id, { eager: true })
  company: Company;

  @Column({ length: 50 })
  code: string; // 업체 내 유니크

  @Column({ length: 50, nullable: true })
  itemCode?: string;

  @Column({ length: 100, nullable: true })
  itemName?: string;

  @Column({ type: 'int', default: 0 })
  qty: number;

  @Column({ type: 'date', nullable: true })
  dueDate?: string;

  @Column({ length: 20, default: 'PLANNED' })
  status: string; // PLANNED / IN_PROGRESS / DONE / HOLD / CANCEL

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => WorkOperation, (op) => op.workOrder)
  operations: WorkOperation[];

  @OneToMany(() => ProductionResult, (res) => res.workOrder)
  results: ProductionResult[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
