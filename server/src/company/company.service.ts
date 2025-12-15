import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepo.find({ order: { id: 'ASC' } });
  }

  // 활성(ACTIVE) 상태의 회사만 반환 - 공개/회원가입용
  async findActive(): Promise<Company[]> {
    return this.companyRepo.find({
      where: { status: 'ACTIVE' },
      order: { id: 'ASC' },
    });
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    const exists = await this.companyRepo.findOne({ where: { code: dto.code } });
    if (exists) {
      throw new BadRequestException('이미 존재하는 회사코드입니다.');
    }
    const company = this.companyRepo.create({
      code: dto.code,
      name: dto.name,
      status: dto.status || 'ACTIVE',
    });
    return this.companyRepo.save(company);
  }

  async update(id: number, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('회사를 찾을 수 없습니다.');
    if (dto.name !== undefined) company.name = dto.name;
    if (dto.status !== undefined) company.status = dto.status;
    return this.companyRepo.save(company);
  }

  // 실제 삭제 대신 상태를 SUSPENDED로 전환하는 소프트 삭제
  async softDelete(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('회사를 찾을 수 없습니다.');
    company.status = 'SUSPENDED'; // UI에서 "삭제(사용정지)"로 표기
    return this.companyRepo.save(company);
  }
}
