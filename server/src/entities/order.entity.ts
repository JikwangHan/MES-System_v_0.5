import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // 수주 코드(회사 내에서 고유)
  @Column({ length: 50 })
  code: string;

  @Column({ length: 100, nullable: true })
  customerName?: string;

  @Column({ length: 50, nullable: true })
  itemCode?: string;

  @Column({ length: 200, nullable: true })
  itemName?: string;

  @Column({ type: 'int', default: 0 })
  qty: number;

  @Column({ type: 'date', nullable: true })
  dueDate?: string;

  // OPEN, IN_PROGRESS, DONE, HOLD, CANCEL 등
  @Column({ length: 30, default: 'OPEN' })
  status: string;

  // 멀티테넌트 강제: 요청 스코프의 tenantId로 자동 필터/주입
  @Column({ type: 'int', index: true })
  tenantId: number;

  @ManyToOne(() => Company, (c) => c.id, { nullable: true })
  company?: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
