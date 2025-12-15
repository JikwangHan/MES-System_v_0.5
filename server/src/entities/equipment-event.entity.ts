import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Equipment } from './equipment.entity';

@Entity('equipment_event')
export class EquipmentEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.id, { eager: true })
  company: Company;

  @ManyToOne(() => Equipment, (equipment) => equipment.events, { eager: true })
  equipment: Equipment;

  @Column({ length: 20, default: 'INFO' })
  level: string; // INFO/WARN/ERROR/CRITICAL

  @Column({ length: 50, nullable: true })
  code?: string; // 설비 프로토콜 이벤트 코드

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'datetime' })
  occurredAt: Date;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
