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

@Entity('sensor_data')
export class SensorData {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.id, { eager: true })
  company: Company;

  @ManyToOne(() => Equipment, (equipment) => equipment.sensors, { eager: true })
  equipment: Equipment;

  @Column({ length: 50 })
  metric: string; // 예: temperature, pressure

  @Column({ type: 'float' })
  value: number;

  @Column({ length: 20, nullable: true })
  unit?: string;

  @Column({ type: 'datetime' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
