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
import { EquipmentEvent } from './equipment-event.entity';
import { SensorData } from './sensor-data.entity';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  code: string; // 업체 내 설비 코드 (UNIQUE with company)

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, nullable: true })
  type?: string;

  @Column({ length: 100, nullable: true })
  location?: string;

  @Column({ length: 30, default: 'IDLE' })
  status: string; // RUNNING/IDLE/DOWN/MAINT 등

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Company, (company) => company.id, { eager: true })
  company: Company;

  @OneToMany(() => EquipmentEvent, (event) => event.equipment)
  events: EquipmentEvent[];

  @OneToMany(() => SensorData, (sensor) => sensor.equipment)
  sensors: SensorData[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
