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
    // 데이터가 거의 없을 때(30건 미만) 더미 수주를 채워 기간별 집계를 눈으로 확인 가능하게 유지
    const needsSeed = count < 30;
    if (!needsSeed) return;

    const companies = await this.companyRepo.find();
    const targets =
      companies.length > 0
        ? companies
        : [await this.companyRepo.save(this.companyRepo.create({ code: 'DEFAULT', name: '위드윈' }))];

    const statuses = ['OPEN', 'IN_PROGRESS', 'DONE', 'HOLD'];
    const today = Date.now();

    for (const company of targets) {
      // 최근 30일 안팎(-15일 ~ +14일)으로 고르게 분포된 30건 더미 생성
      for (let i = 0; i < 30; i += 1) {
        const idx = i + 1;
        const offsetDay = i - 15; // -15일 ~ +14일
        const due = new Date(today + offsetDay * 86400000).toISOString().slice(0, 10);
        const order = this.orderRepo.create({
          code: `ORD-${company.code}-${idx.toString().padStart(3, '0')}`,
          customerName: `고객사${idx}`,
          itemCode: `ITEM-${idx}`,
          itemName: `제품-${idx}`,
          qty: 100 + idx * 5,
          dueDate: due,
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

  async create(user: any, dto: Partial<Order> & { companyCode?: string }) {
    const company = await this.getCompanyForUser(user, dto.companyCode);
    const exists = await this.orderRepo.findOne({
      where: {
        code: dto.code!,
        ...(company ? { company: { id: company.id } } : {}),
      },
    });
    if (exists) throw new ForbiddenException('동일한 수주코드가 이미 존재합니다.');
    const order = this.orderRepo.create({
      code: dto.code!,
      customerName: dto.customerName,
      itemCode: dto.itemCode,
      itemName: dto.itemName,
      qty: dto.qty ?? 0,
      dueDate: dto.dueDate,
      status: dto.status || 'OPEN',
      company: company || undefined,
    });
    return this.orderRepo.save(order);
  }

  async update(user: any, id: number, dto: Partial<Order> & { companyCode?: string }) {
    const target = await this.orderRepo.findOne({ where: { id }, relations: ['company'] });
    if (!target) throw new NotFoundException('수주를 찾을 수 없습니다.');
    if (user.role !== 'SYSTEM_ADMIN') {
      const c = await this.getCompanyForUser(user);
      if (!target.company || target.company.id !== c!.id) throw new ForbiddenException('다른 업체의 수주는 수정할 수 없습니다.');
    }
    if (dto.code && dto.code !== target.code) {
      const exists = await this.orderRepo.findOne({
        where: { code: dto.code, company: target.company ? { id: target.company.id } : undefined },
      });
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

  async remove(user: any, id: number) {
    const target = await this.orderRepo.findOne({ where: { id }, relations: ['company'] });
    if (!target) throw new NotFoundException('수주를 찾을 수 없습니다.');
    if (user.role !== 'SYSTEM_ADMIN') {
      const c = await this.getCompanyForUser(user);
      if (!target.company || target.company.id !== c!.id) throw new ForbiddenException('다른 업체의 수주는 삭제할 수 없습니다.');
    }
    await this.orderRepo.delete(id);
    return { success: true };
  }
}
