import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Company } from '../entities/company.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Company])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
