import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Company } from '../entities/company.entity';
import { ListOrdersDto } from './dto/list-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
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
      return null; // ALL or 미지정이면 전체 조회 허용
    }
    if (!user.companyId) throw new ForbiddenException('업체 정보가 없습니다.');
    const company = await this.companyRepo.findOne({ where: { id: user.companyId } });
    if (!company) throw new NotFoundException('업체를 찾을 수 없습니다.');
    return company;
  }

  private async seedIfEmpty(): Promise<void> {
    const count = await this.orderRepo.count();
    if (count > 0) return;
    const companies = await this.companyRepo.find();
    const targets = companies.length > 0 ? companies : [await this.companyRepo.save(this.companyRepo.create({ code: 'DEFAULT', name: '위드윈' }))];
    const statuses = ['OPEN', 'IN_PROGRESS', 'DONE', 'HOLD'];
    for (const company of targets) {
      for (let i = 0; i < 8; i += 1) {
        const idx = i + 1;
        const order = this.orderRepo.create({
          code: `ORD-${company.code}-${idx.toString().padStart(3, '0')}`,
          customerName: `고객사${idx}`,
          itemCode: `ITEM-${idx}`,
          itemName: `제품-${idx}`,
          qty: 100 + idx * 10,
          dueDate: new Date(Date.now() + idx * 86400000).toISOString().slice(0, 10),
          status: statuses[idx % statuses.length],
          company,
        });
        await this.orderRepo.save(order);
      }
    }
  }

  async findAll(user: any, filters: ListOrdersDto): Promise<{ items: Order[]; total: number }> {
    await this.seedIfEmpty();
    const qb = this.orderRepo.createQueryBuilder('o').leftJoinAndSelect('o.company', 'company');

    const company = await this.getCompanyForUser(user, filters.companyCode);
    if (company) {
      qb.where('o.companyId = :cid', { cid: company.id });
    } else if (filters.companyCode && filters.companyCode !== 'ALL') {
      qb.where('company.code = :cc', { cc: filters.companyCode });
    }

    if (filters.code) qb.andWhere('o.code LIKE :code', { code: `%${filters.code}%` });
    if (filters.customerName) qb.andWhere('o.customerName LIKE :cust', { cust: `%${filters.customerName}%` });
    if (filters.itemName) qb.andWhere('o.itemName LIKE :item', { item: `%${filters.itemName}%` });
    if (filters.status) qb.andWhere('o.status = :status', { status: filters.status });
    if (filters.dueFrom) qb.andWhere('o.dueDate >= :df', { df: filters.dueFrom });
    if (filters.dueTo) qb.andWhere('o.dueDate <= :dt', { dt: filters.dueTo });

    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 10;

    const [items, total] = await qb.orderBy('o.id', 'ASC').skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { items, total };
  }
}
