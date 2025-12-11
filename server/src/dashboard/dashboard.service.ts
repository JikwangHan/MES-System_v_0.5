import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder } from '../entities/work-order.entity';
import { Order } from '../entities/order.entity';
import { Inventory } from '../entities/inventory.entity';
import { Equipment } from '../entities/equipment.entity';
import { Company } from '../entities/company.entity';
import dayjs from 'dayjs';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly workRepo: Repository<WorkOrder>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  private async companyFilter(companyCode?: string) {
    if (!companyCode || companyCode === 'ALL') return {};
    const company = await this.companyRepo.findOne({ where: { code: companyCode } });
    return company ? { company: { id: company.id } } : {};
  }

  // 기간/회사 필터에 맞춰 일자별 수주 건수를 차트 형태로 반환
  private async buildOrderChart(filter: any, from?: Date, to?: Date) {
    // dueDate가 없을 때는 createdAt으로 대체
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .select('DATE(COALESCE(o.dueDate, o.createdAt))', 'd')
      .addSelect('COUNT(*)', 'cnt');

    if (filter?.company) {
      qb.where('o.companyId = :cid', { cid: (filter as any).company.id });
    }
    if (from) {
      qb.andWhere('COALESCE(o.dueDate, o.createdAt) >= :from', { from });
    }
    if (to) {
      qb.andWhere('COALESCE(o.dueDate, o.createdAt) <= :to', { to });
    }

    const rows = await qb.groupBy('DATE(COALESCE(o.dueDate, o.createdAt))').orderBy('d', 'ASC').getRawMany();

    // 데이터가 없으면 오늘 기준 0 포인트라도 반환해 차트가 비지 않도록 처리
    if (!rows || rows.length === 0) {
      const base = dayjs().format('MM-DD');
      return [{ name: base, good: 0, defect: 0 }];
    }

    return rows.map((r: any) => ({
      name: dayjs(r.d).format('MM-DD'),
      good: Number(r.cnt) || 0,
      defect: 0,
    }));
  }

  async summary(user: any, companyCode?: string, period: 'today' | 'week' | 'month' = 'today') {
    const filter = await this.companyFilter(companyCode);

    // 기간 필터: 오늘/1주/1달
    const now = dayjs();
    let from: Date | undefined;
    const to = now.endOf('day').toDate();
    if (period === 'today') from = now.startOf('day').toDate();
    if (period === 'week') from = now.subtract(7, 'day').startOf('day').toDate();
    if (period === 'month') from = now.subtract(30, 'day').startOf('day').toDate();

    // 회사/기간 필터를 적용한 카운트 계산
    const workQb = this.workRepo.createQueryBuilder('w').leftJoin('w.company', 'c');
    const orderQb = this.orderRepo.createQueryBuilder('o').leftJoin('o.company', 'c2');
    const eqQb = this.equipmentRepo.createQueryBuilder('e').leftJoin('e.company', 'c3');
    const lowStockQb = this.inventoryRepo.createQueryBuilder('i').leftJoin('i.company', 'c4').where('i.status = :low', { low: 'LOW' });

    if (filter?.company) {
      workQb.where('w.companyId = :cid', { cid: (filter as any).company.id });
      orderQb.where('o.companyId = :cid', { cid: (filter as any).company.id });
      eqQb.where('e.companyId = :cid', { cid: (filter as any).company.id });
      lowStockQb.andWhere('i.companyId = :cid', { cid: (filter as any).company.id });
    }
    if (from) {
      workQb.andWhere('w.createdAt >= :from', { from });
      // 수주는 납기일이 없을 경우 생성일 기준으로 기간 필터
      orderQb.andWhere('COALESCE(o.dueDate, o.createdAt) >= :from', { from });
      eqQb.andWhere('e.createdAt >= :from', { from });
      lowStockQb.andWhere('i.createdAt >= :from', { from });
    }
    if (to) {
      workQb.andWhere('w.createdAt <= :to', { to });
      orderQb.andWhere('COALESCE(o.dueDate, o.createdAt) <= :to', { to });
      eqQb.andWhere('e.createdAt <= :to', { to });
      lowStockQb.andWhere('i.createdAt <= :to', { to });
    }

    const [workCnt, orderCnt, eqCnt, lowStockCnt] = await Promise.all([
      workQb.getCount(),
      orderQb.getCount(),
      eqQb.getCount(),
      lowStockQb.getCount(),
    ]);

    // 지연 수주(납기 초과)
    const overdueOrders = await this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.company', 'company')
      .where(from ? 'COALESCE(o.dueDate, o.createdAt) >= :from' : '1=1', from ? { from } : {})
      .andWhere(to ? 'COALESCE(o.dueDate, o.createdAt) <= :to' : '1=1', to ? { to } : {})
      .andWhere('o.status != :done', { done: 'DONE' })
      .andWhere('o.dueDate IS NOT NULL')
      .andWhere('o.dueDate < CURRENT_DATE')
      .andWhere(filter?.company ? 'o.companyId = :cid' : '1=1', filter?.company ? { cid: (filter as any).company.id } : {})
      .orderBy('o.dueDate', 'ASC')
      .limit(5)
      .getMany();

    // 부족 재고
    const lowStock = await this.inventoryRepo.find({
      where: { ...filter, status: 'LOW' },
      order: { qty: 'ASC' },
      take: 5,
      relations: ['company'],
    });

    // 최근 수주 5개
    const recentOrders = await this.orderRepo.find({
      where: filter,
      order: { id: 'DESC' },
      take: 5,
      relations: ['company'],
    });

    // 기간/회사 필터에 맞는 차트 데이터 생성
    const chart = await this.buildOrderChart(filter, from, to);

    const alerts = [
      ...overdueOrders.map((o) => ({
        type: 'overdue-order',
        message: `지연 수주: ${o.code} (납기 ${o.dueDate ?? '-'})`,
      })),
      ...lowStock.map((i) => ({
        type: 'low-stock',
        message: `부족 재고: ${i.itemName} (${i.qty}/${i.safetyQty})`,
      })),
    ];

    return {
      kpis: {
        workOrders: workCnt,
        orders: orderCnt,
        equipments: eqCnt,
        lowStock: lowStockCnt,
      },
      chart,
      recentOrders,
      alerts,
    };
  }
}
