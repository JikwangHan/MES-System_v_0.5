import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Company } from '../entities/company.entity';
import { ListInventoryDto } from './dto/list-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  private async getCompanyForUser(user: any, companyCode?: string): Promise<Company | null> {
    if (user.role === 'SYSTEM_ADMIN') {
      if (companyCode && companyCode !== 'ALL') {
        const company = await this.companyRepo.findOne({ where: { code: companyCode } });
        if (!company) throw new NotFoundException('업체를 찾을 수 없습니다.');
        return company;
      }
      return null;
    }
    if (!user.companyId) throw new ForbiddenException('업체 정보가 없습니다.');
    const company = await this.companyRepo.findOne({ where: { id: user.companyId } });
    if (!company) throw new NotFoundException('업체를 찾을 수 없습니다.');
    return company;
  }

  private async seedIfEmpty(): Promise<void> {
    const count = await this.inventoryRepo.count();
    if (count > 0) return;
    const companies = await this.companyRepo.find();
    const targets = companies.length > 0 ? companies : [await this.companyRepo.save(this.companyRepo.create({ code: 'DEFAULT', name: '위드윈' }))];
    for (const company of targets) {
      for (let i = 0; i < 8; i += 1) {
        const idx = i + 1;
        const inv = this.inventoryRepo.create({
          itemCode: `ITEM-${idx}`,
          itemName: `제품-${idx}`,
          warehouse: idx % 2 === 0 ? '본사창고' : '2공장',
          location: `LOC-${idx}`,
          qty: 500 - idx * 20,
          safetyQty: 200,
          status: idx % 3 === 0 ? 'LOW' : 'AVAILABLE',
          company,
        });
        await this.inventoryRepo.save(inv);
      }
    }
  }

  async findAll(user: any, filters: ListInventoryDto): Promise<{ items: Inventory[]; total: number }> {
    await this.seedIfEmpty();
    const qb = this.inventoryRepo.createQueryBuilder('inv').leftJoinAndSelect('inv.company', 'company');

    const company = await this.getCompanyForUser(user, filters.companyCode);
    if (company) {
      qb.where('inv.companyId = :cid', { cid: company.id });
    } else if (filters.companyCode && filters.companyCode !== 'ALL') {
      qb.where('company.code = :cc', { cc: filters.companyCode });
    }

    if (filters.itemCode) qb.andWhere('inv.itemCode LIKE :code', { code: `%${filters.itemCode}%` });
    if (filters.itemName) qb.andWhere('inv.itemName LIKE :name', { name: `%${filters.itemName}%` });
    if (filters.warehouse) qb.andWhere('inv.warehouse LIKE :wh', { wh: `%${filters.warehouse}%` });
    if (filters.status) qb.andWhere('inv.status = :status', { status: filters.status });

    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 10;
    const [items, total] = await qb.orderBy('inv.id', 'ASC').skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { items, total };
  }
}
