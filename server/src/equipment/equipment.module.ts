import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from '../entities/equipment.entity';
import { EquipmentEvent } from '../entities/equipment-event.entity';
import { SensorData } from '../entities/sensor-data.entity';
import { Company } from '../entities/company.entity';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment, EquipmentEvent, SensorData, Company])],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
