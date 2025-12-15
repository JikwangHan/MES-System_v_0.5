import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { ListOrdersDto } from './dto/list-orders.dto';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  private ensureTenantId(user: any, reqTenantId?: string): number {
    const tenantId = reqTenantId ?? (user?.companyId != null ? String(user.companyId) : undefined);
    if (!tenantId) throw new BadRequestException('TenantId is required.');
    return Number(tenantId);
  }

  async findAll(user: any, filters: ListOrdersDto, reqTenantId?: string): Promise<{ items: Order[]; total: number }> {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const qb = this.orderRepo.createQueryBuilder('o');

    qb.where('o.tenantId = :tid', { tid: tenantId });

    if (filters.code) qb.andWhere('o.code LIKE :code', { code: `%${filters.code}%` });
    if (filters.customerName) qb.andWhere('o.customerName LIKE :cust', { cust: `%${filters.customerName}%` });
    if (filters.itemName) qb.andWhere('o.itemName LIKE :item', { item: `%${filters.itemName}%` });
    if (filters.status) qb.andWhere('o.status = :status', { status: filters.status });
    if (filters.dueFrom) qb.andWhere('o.dueDate >= :df', { df: filters.dueFrom });
    if (filters.dueTo) qb.andWhere('o.dueDate <= :dt', { dt: filters.dueTo });

    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 10;

    const [items, total] = await qb
      .orderBy('o.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { items, total };
  }

  async create(user: any, dto: Partial<Order>, reqTenantId?: string) {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const exists = await this.orderRepo.findOne({ where: { code: dto.code!, tenantId } });
    if (exists) throw new ForbiddenException('동일한 수주코드가 이미 존재합니다.');
    const order = this.orderRepo.create({
      code: dto.code!,
      customerName: dto.customerName,
      itemCode: dto.itemCode,
      itemName: dto.itemName,
      qty: dto.qty ?? 0,
      dueDate: dto.dueDate,
      status: dto.status || 'OPEN',
      tenantId,
    });
    return this.orderRepo.save(order);
  }

  async update(user: any, id: number, dto: Partial<Order>, reqTenantId?: string) {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const target = await this.orderRepo.findOne({ where: { id, tenantId } });
    if (!target) throw new NotFoundException('수주를 찾을 수 없습니다.');

    if (dto.code && dto.code !== target.code) {
      const exists = await this.orderRepo.findOne({ where: { code: dto.code, tenantId } });
      if (exists) throw new ForbiddenException('동일한 수주코드가 이미 존재합니다.');
    }
    Object.assign(target, {
      code: dto.code ?? target.code,
      customerName: dto.customerName ?? target.customerName,
      itemCode: dto.itemCode ?? target.itemCode,
      itemName: dto.itemName ?? target.itemName,
      qty: dto.qty ?? target.qty,
      dueDate: dto.dueDate ?? target.dueDate,
      status: dto.status ?? target.status,
    });
    return this.orderRepo.save(target);
  }

  async remove(user: any, id: number, reqTenantId?: string) {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const target = await this.orderRepo.findOne({ where: { id, tenantId } });
    if (!target) throw new NotFoundException('수주를 찾을 수 없습니다.');
    await this.orderRepo.delete(id);
    return { success: true };
  }
}
