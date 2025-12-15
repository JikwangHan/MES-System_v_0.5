import { Controller, Get } from '@nestjs/common';
import { CompanyService } from './company.service';

// 공개용 회사 목록 조회(로그인 없이 활성 회사 목록만 노출)
@Controller('companies')
export class CompanyPublicController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async listActive() {
    return this.companyService.findActive();
  }
}
