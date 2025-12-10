import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from '../entities/work-order.entity';
import { WorkOperation } from '../entities/work-operation.entity';
import { ProductionResult } from '../entities/production-result.entity';
import { Company } from '../entities/company.entity';
import { WorkService } from './work.service';
import { WorkController } from './work.controller';

// ▶ WorkModule
// - 작업지시/공정/실적과 관련된 API를 제공합니다.
// - 멀티테넌트 구조를 반영하여 항상 업체 단위로 데이터를 조회/생성합니다.
@Module({
  imports: [
    TypeOrmModule.forFeature([WorkOrder, WorkOperation, ProductionResult, Company]),
  ],
  controllers: [WorkController],
  providers: [WorkService],
  exports: [WorkService],
})
export class WorkModule {}
