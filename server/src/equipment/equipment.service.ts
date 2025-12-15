import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../entities/equipment.entity';
import { EquipmentEvent } from '../entities/equipment-event.entity';
import { SensorData } from '../entities/sensor-data.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,
    @InjectRepository(EquipmentEvent)
    private readonly eventRepo: Repository<EquipmentEvent>,
    @InjectRepository(SensorData)
    private readonly sensorRepo: Repository<SensorData>,
  ) {}

  private ensureTenantId(user: any, reqTenantId?: string): number {
    const tenantId = reqTenantId ?? (user?.companyId != null ? String(user.companyId) : undefined);
    if (!tenantId) throw new BadRequestException('TenantId is required.');
    return Number(tenantId);
  }

  async findAll(user: any, filters: any, reqTenantId?: string): Promise<{ items: Equipment[]; total: number }> {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const qb = this.equipmentRepo.createQueryBuilder('eq');

    qb.where('eq.tenantId = :tid', { tid: tenantId });

    if (filters?.code) qb.andWhere('eq.code LIKE :code', { code: `%${filters.code}%` });
    if (filters?.name) qb.andWhere('eq.name LIKE :name', { name: `%${filters.name}%` });
    if (filters?.status) qb.andWhere('eq.status = :status', { status: filters.status });

    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 10;
    const [items, total] = await qb
      .orderBy('eq.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { items, total };
  }

  async create(user: any, dto: CreateEquipmentDto, reqTenantId?: string): Promise<Equipment> {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    const exists = await this.equipmentRepo.findOne({ where: { code: dto.code, tenantId } });
    if (exists) throw new ForbiddenException('동일한 코드의 설비가 이미 존재합니다.');

    const eq = this.equipmentRepo.create({
      code: dto.code,
      name: dto.name,
      type: dto.type,
      location: dto.location,
      status: dto.status || 'IDLE',
      description: dto.description,
      tenantId,
    });
    return this.equipmentRepo.save(eq);
  }

  async findEvents(user: any, equipmentId: number, reqTenantId?: string): Promise<EquipmentEvent[]> {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    return this.eventRepo.find({
      where: { equipment: { id: equipmentId }, tenantId },
      order: { occurredAt: 'DESC' },
      take: 100,
    });
  }

  async findSensors(user: any, equipmentId: number, reqTenantId?: string): Promise<SensorData[]> {
    const tenantId = this.ensureTenantId(user, reqTenantId);
    return this.sensorRepo.find({
      where: { equipment: { id: equipmentId }, tenantId },
      order: { recordedAt: 'DESC' },
      take: 200,
    });
  }
}
