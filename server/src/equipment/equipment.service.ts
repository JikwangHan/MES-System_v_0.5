import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../entities/equipment.entity';
import { EquipmentEvent } from '../entities/equipment-event.entity';
import { SensorData } from '../entities/sensor-data.entity';
import { Company } from '../entities/company.entity';
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
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  private async getCompanyForUser(user: any, dtoCompanyCode?: string): Promise<Company> {
    // SYSTEM_ADMIN: companyCode 명시 시 해당 업체, 없으면 자신의 companyId(없으면 예외)
    if (user.role === 'SYSTEM_ADMIN') {
      if (dtoCompanyCode) {
        const company = await this.companyRepo.findOne({ where: { code: dtoCompanyCode } });
        if (!company) throw new NotFoundException('업체를 찾을 수 없습니다.');
        return company;
      }
      // companyId가 없는 SYSTEM_ADMIN이면 예외
      if (!user.companyId) throw new ForbiddenException('업체 정보를 찾을 수 없습니다.');
      const company = await this.companyRepo.findOne({ where: { id: user.companyId } });
      if (!company) throw new NotFoundException('업체를 찾을 수 없습니다.');
      return company;
    }
    // COMPANY_ADMIN/USER: 자신의 companyId만 사용
    if (!user.companyId) throw new ForbiddenException('업체 정보가 없습니다.');
    const company = await this.companyRepo.findOne({ where: { id: user.companyId } });
    if (!company) throw new NotFoundException('업체를 찾을 수 없습니다.');
    return company;
  }

  async findAll(user: any, filters: any): Promise<{ items: Equipment[]; total: number }> {
    const qb = this.equipmentRepo
      .createQueryBuilder('eq')
      .leftJoinAndSelect('eq.company', 'company');

    if (user.role === 'SYSTEM_ADMIN') {
      if (filters?.companyCode && filters.companyCode !== 'ALL') {
        qb.where('company.code = :cc', { cc: filters.companyCode });
      }
    } else {
      const company = await this.getCompanyForUser(user);
      qb.where('eq.companyId = :cid', { cid: company.id });
    }

    if (filters?.code) qb.andWhere('eq.code LIKE :code', { code: `%${filters.code}%` });
    if (filters?.name) qb.andWhere('eq.name LIKE :name', { name: `%${filters.name}%` });
    if (filters?.status) qb.andWhere('eq.status = :status', { status: filters.status });

    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 10;
    const [items, total] = await qb.orderBy('eq.id', 'ASC').skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { items, total };
  }

  async create(user: any, dto: CreateEquipmentDto): Promise<Equipment> {
    const company = await this.getCompanyForUser(user, dto.companyCode);
    const exists = await this.equipmentRepo.findOne({
      where: { code: dto.code, company: { id: company.id } },
    });
    if (exists) throw new ForbiddenException('동일한 코드의 설비가 이미 존재합니다.');

    const eq = this.equipmentRepo.create({
      code: dto.code,
      name: dto.name,
      type: dto.type,
      location: dto.location,
      status: dto.status || 'IDLE',
      description: dto.description,
      company,
    });
    return this.equipmentRepo.save(eq);
  }

  async findEvents(user: any, equipmentId: number): Promise<EquipmentEvent[]> {
    const company = await this.getCompanyForUser(user);
    return this.eventRepo.find({
      where: { equipment: { id: equipmentId }, company: { id: company.id } },
      order: { occurredAt: 'DESC' },
      take: 100,
    });
  }

  async findSensors(user: any, equipmentId: number): Promise<SensorData[]> {
    const company = await this.getCompanyForUser(user);
    return this.sensorRepo.find({
      where: { equipment: { id: equipmentId }, company: { id: company.id } },
      order: { recordedAt: 'DESC' },
      take: 200,
    });
  }
}
