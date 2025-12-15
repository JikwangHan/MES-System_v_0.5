import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder } from '../entities/work-order.entity';
import { WorkOperation } from '../entities/work-operation.entity';
import { ProductionResult } from '../entities/production-result.entity';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';

@Injectable()
export class WorkService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly workRepo: Repository<WorkOrder>,
    @InjectRepository(WorkOperation)
    private readonly opRepo: Repository<WorkOperation>,
    @InjectRepository(ProductionResult)
    private readonly resultRepo: Repository<ProductionResult>,
  ) {}

  private ensureTenantId(user: any, reqTenantId?: string): number {
    const tenantId = reqTenantId ?? (user?.companyId != null ? String(user.companyId) : undefined);
    if (!tenantId) throw new BadRequestException('TenantId is required.');
    return Number(tenantId);
  }

  async findAll(user: any, filters: any, reqTenantId?: string): Promise<{ items: WorkOrder[]; total: number }> {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const qb = this.workRepo.createQueryBuilder('wo');

    qb.where('wo.tenantId = :tid', { tid: tenantId });

    if (filters.status) qb.andWhere('wo.status = :status', { status: filters.status });
    if (filters.code) qb.andWhere('wo.code LIKE :code', { code: `%${filters.code}%` });
    if (filters.itemName) qb.andWhere('wo.itemName LIKE :itemName', { itemName: `%${filters.itemName}%` });
    if (filters.dueFrom) qb.andWhere('wo.dueDate >= :dueFrom', { dueFrom: filters.dueFrom });
    if (filters.dueTo) qb.andWhere('wo.dueDate <= :dueTo', { dueTo: filters.dueTo });

    // 페이지네이션 기본값
    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 10;
    const [items, total] = await qb
      .orderBy('wo.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { items, total };
  }

  async create(user: any, dto: CreateWorkOrderDto, reqTenantId?: string): Promise<WorkOrder> {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const exists = await this.workRepo.findOne({ where: { code: dto.code, tenantId } });
    if (exists) throw new ForbiddenException('동일한 코드의 작업지시가 이미 존재합니다.');
    const wo = this.workRepo.create({
      code: dto.code,
      itemCode: dto.itemCode,
      itemName: dto.itemName,
      qty: dto.qty,
      dueDate: dto.dueDate,
      status: dto.status || 'PLANNED',
      description: dto.description,
      tenantId,
    });
    return this.workRepo.save(wo);
  }

  async findOperations(user: any, workOrderId: number, reqTenantId?: string): Promise<WorkOperation[]> {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    return this.opRepo.find({
      where: { workOrder: { id: workOrderId }, tenantId },
      order: { seq: 'ASC' },
    });
  }

  async findResults(user: any, workOrderId: number, reqTenantId?: string): Promise<ProductionResult[]> {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    return this.resultRepo.find({
      where: { workOrder: { id: workOrderId }, tenantId },
      order: { recordedAt: 'DESC' },
    });
  }
}
