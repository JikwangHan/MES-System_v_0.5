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
import { Equipment } from './equipment.entity';

@Entity('work_operation')
export class WorkOperation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.id, { eager: true })
  company: Company;

  @ManyToOne(() => WorkOrder, (wo) => wo.operations, { eager: true })
  workOrder: WorkOrder;

  @ManyToOne(() => Equipment, (eq) => eq.id, { nullable: true, eager: true })
  equipment?: Equipment;

  @Column({ type: 'int', default: 1 })
  seq: number;

  @Column({ type: 'datetime', nullable: true })
  planStartAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  planEndAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  actualStartAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  actualEndAt?: Date;

  @Column({ length: 20, default: 'PLANNED' })
  status: string; // PLANNED / RUNNING / DONE / HOLD

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
