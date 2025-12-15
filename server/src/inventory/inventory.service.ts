import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import { ListInventoryDto } from './dto/list-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  private ensureTenantId(user: any, reqTenantId?: string): number {
    const tenantId = reqTenantId ?? (user?.companyId != null ? String(user.companyId) : undefined);
    if (!tenantId) throw new BadRequestException('TenantId is required.');
    return Number(tenantId);
  }

  async findAll(user: any, filters: ListInventoryDto, reqTenantId?: string): Promise<{ items: Inventory[]; total: number }> {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const qb = this.inventoryRepo.createQueryBuilder('inv');

    qb.where('inv.tenantId = :tid', { tid: tenantId });

    if (filters.itemCode) qb.andWhere('inv.itemCode LIKE :code', { code: `%${filters.itemCode}%` });
    if (filters.itemName) qb.andWhere('inv.itemName LIKE :name', { name: `%${filters.itemName}%` });
    if (filters.warehouse) qb.andWhere('inv.warehouse LIKE :wh', { wh: `%${filters.warehouse}%` });
    if (filters.status) qb.andWhere('inv.status = :status', { status: filters.status });

    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 10;
    const [items, total] = await qb.orderBy('inv.id', 'ASC').skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { items, total };
  }

  async create(user: any, dto: Partial<Inventory>, reqTenantId?: string) {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const inv = this.inventoryRepo.create({
      itemCode: dto.itemCode!,
      itemName: dto.itemName!,
      warehouse: dto.warehouse,
      location: dto.location,
      qty: dto.qty ?? 0,
      safetyQty: dto.safetyQty ?? 0,
      status: dto.status || 'AVAILABLE',
      tenantId,
    });
    return this.inventoryRepo.save(inv);
  }

  async update(user: any, id: number, dto: Partial<Inventory>, reqTenantId?: string) {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const target = await this.inventoryRepo.findOne({ where: { id, tenantId } });
    if (!target) throw new NotFoundException('재고를 찾을 수 없습니다.');
    Object.assign(target, {
      itemCode: dto.itemCode ?? target.itemCode,
      itemName: dto.itemName ?? target.itemName,
      warehouse: dto.warehouse ?? target.warehouse,
      location: dto.location ?? target.location,
      qty: dto.qty ?? target.qty,
      safetyQty: dto.safetyQty ?? target.safetyQty,
      status: dto.status ?? target.status,
    });
    return this.inventoryRepo.save(target);
  }

  async remove(user: any, id: number, reqTenantId?: string) {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const target = await this.inventoryRepo.findOne({ where: { id, tenantId } });
    if (!target) throw new NotFoundException('재고를 찾을 수 없습니다.');
    await this.inventoryRepo.delete(id);
    return { success: true };
  }
}
