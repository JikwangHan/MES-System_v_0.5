import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder } from '../entities/work-order.entity';
import { Order } from '../entities/order.entity';
import { Inventory } from '../entities/inventory.entity';
import { Equipment } from '../entities/equipment.entity';
import { Company } from '../entities/company.entity';

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

  async summary(user: any, companyCode?: string) {
    const filter = await this.companyFilter(companyCode);

    const [workCnt, orderCnt, eqCnt, lowStockCnt] = await Promise.all([
      this.workRepo.count({ where: filter }),
      this.orderRepo.count({ where: filter }),
      this.equipmentRepo.count({ where: filter }),
      this.inventoryRepo.count({ where: { ...filter, status: 'LOW' } }),
    ]);

    // 간단한 최근 주문 5개
    const recentOrders = await this.orderRepo.find({
      where: filter,
      order: { id: 'DESC' },
      take: 5,
      relations: ['company'],
    });

    // 생산/불량 더미 차트 (필요 시 work order 기준으로 확장)
    const chart = [
      { name: '월', good: 120, defect: 2 },
      { name: '화', good: 150, defect: 3 },
      { name: '수', good: 160, defect: 1 },
      { name: '목', good: 140, defect: 4 },
      { name: '금', good: 170, defect: 2 },
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
    };
  }
}
