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

  async summary(user: any, companyCode?: string, period: 'today' | 'week' | 'month' = 'today') {
    const filter = await this.companyFilter(companyCode);

    // 기간 필터: 오늘/1주/1달
    const now = dayjs();
    let from: Date | undefined;
    if (period === 'today') from = now.startOf('day').toDate();
    if (period === 'week') from = now.subtract(7, 'day').startOf('day').toDate();
    if (period === 'month') from = now.subtract(30, 'day').startOf('day').toDate();

    const dateFilter = from ? { ...filter, createdAt: { $gte: from } } : filter;

    const [workCnt, orderCnt, eqCnt, lowStockCnt] = await Promise.all([
      this.workRepo.count({ where: filter }),
      this.orderRepo.count({ where: dateFilter as any }),
      this.equipmentRepo.count({ where: filter }),
      this.inventoryRepo.count({ where: { ...filter, status: 'LOW' } }),
    ]);

    // 지연 수주(납기 초과)
    const overdueOrders = await this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.company', 'company')
      .where(from ? 'o.createdAt >= :from' : '1=1', from ? { from } : {})
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

    // 단순 차트 예시: 기간 내 수주 수
    const chart = [
      { name: 'Week1', good: Math.max(orderCnt - 2, 0), defect: 1 },
      { name: 'Week2', good: orderCnt, defect: 2 },
      { name: 'Week3', good: Math.max(orderCnt - 1, 0), defect: 1 },
      { name: 'Week4', good: orderCnt + 1, defect: 0 },
    ];

    // 최근 수주 5개
    const recentOrders = await this.orderRepo.find({
      where: filter,
      order: { id: 'DESC' },
      take: 5,
      relations: ['company'],
    });

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
