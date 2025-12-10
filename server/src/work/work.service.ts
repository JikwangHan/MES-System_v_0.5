import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder } from '../entities/work-order.entity';
import { WorkOperation } from '../entities/work-operation.entity';
import { ProductionResult } from '../entities/production-result.entity';
import { Company } from '../entities/company.entity';
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
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  private async getCompanyForUser(user: any, dtoCompanyCode?: string): Promise<Company> {
    if (user.role === 'SYSTEM_ADMIN') {
      if (dtoCompanyCode) {
        const company = await this.companyRepo.findOne({ where: { code: dtoCompanyCode } });
        if (!company) throw new NotFoundException('업체를 찾을 수 없습니다.');
        return company;
      }
      if (!user.companyId) throw new ForbiddenException('업체 정보를 찾을 수 없습니다.');
      const company = await this.companyRepo.findOne({ where: { id: user.companyId } });
      if (!company) throw new NotFoundException('업체를 찾을 수 없습니다.');
      return company;
    }
    if (!user.companyId) throw new ForbiddenException('업체 정보가 없습니다.');
    const company = await this.companyRepo.findOne({ where: { id: user.companyId } });
    if (!company) throw new NotFoundException('업체를 찾을 수 없습니다.');
    return company;
  }

  async findAll(user: any, filters: any): Promise<WorkOrder[]> {
    const qb = this.workRepo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.company', 'company');

    // SYSTEM_ADMIN은 업체 선택값이 ALL이면 모든 업체, 특정 코드면 해당 업체만 조회
    if (user.role === 'SYSTEM_ADMIN') {
      if (filters?.companyCode && filters.companyCode !== 'ALL') {
        qb.where('company.code = :cc', { cc: filters.companyCode });
      }
    } else {
      const company = await this.getCompanyForUser(user);
      qb.where('wo.companyId = :cid', { cid: company.id });
    }

    if (filters.status) qb.andWhere('wo.status = :status', { status: filters.status });
    if (filters.code) qb.andWhere('wo.code LIKE :code', { code: `%${filters.code}%` });
    if (filters.itemName) qb.andWhere('wo.itemName LIKE :itemName', { itemName: `%${filters.itemName}%` });
    if (filters.dueFrom) qb.andWhere('wo.dueDate >= :dueFrom', { dueFrom: filters.dueFrom });
    if (filters.dueTo) qb.andWhere('wo.dueDate <= :dueTo', { dueTo: filters.dueTo });
    return qb.orderBy('wo.id', 'ASC').getMany();
  }

  async create(user: any, dto: CreateWorkOrderDto): Promise<WorkOrder> {
    const company = await this.getCompanyForUser(user, dto.companyCode);
    const exists = await this.workRepo.findOne({ where: { code: dto.code, company: { id: company.id } } });
    if (exists) throw new ForbiddenException('동일한 코드의 작업지시가 이미 존재합니다.');
    const wo = this.workRepo.create({
      code: dto.code,
      itemCode: dto.itemCode,
      itemName: dto.itemName,
      qty: dto.qty,
      dueDate: dto.dueDate,
      status: dto.status || 'PLANNED',
      description: dto.description,
      company,
    });
    return this.workRepo.save(wo);
  }

  async findOperations(user: any, workOrderId: number): Promise<WorkOperation[]> {
    const company = await this.getCompanyForUser(user);
    return this.opRepo.find({
      where: { workOrder: { id: workOrderId }, company: { id: company.id } },
      order: { seq: 'ASC' },
    });
  }

  async findResults(user: any, workOrderId: number): Promise<ProductionResult[]> {
    const company = await this.getCompanyForUser(user);
    return this.resultRepo.find({
      where: { workOrder: { id: workOrderId }, company: { id: company.id } },
      order: { recordedAt: 'DESC' },
    });
  }
}
