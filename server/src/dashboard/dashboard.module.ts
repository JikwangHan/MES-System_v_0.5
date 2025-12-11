import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { WorkOrder } from '../entities/work-order.entity';
import { Order } from '../entities/order.entity';
import { Inventory } from '../entities/inventory.entity';
import { Equipment } from '../entities/equipment.entity';
import { Company } from '../entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder, Order, Inventory, Equipment, Company])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
