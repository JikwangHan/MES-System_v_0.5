import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { WorkOrder } from './work-order.entity';
import { WorkOperation } from './work-operation.entity';

@Entity('production_result')
export class ProductionResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', index: true })
  tenantId: number;

  @ManyToOne(() => Company, (company) => company.id, { eager: true, nullable: true })
  company?: Company;

  @ManyToOne(() => WorkOrder, (wo) => wo.results, { eager: true })
  workOrder: WorkOrder;

  @ManyToOne(() => WorkOperation, (op) => op.id, { nullable: true, eager: true })
  workOperation?: WorkOperation;

  @Column({ type: 'int', default: 0 })
  goodQty: number;

  @Column({ type: 'int', default: 0 })
  defectQty: number;

  @Column({ type: 'datetime' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
