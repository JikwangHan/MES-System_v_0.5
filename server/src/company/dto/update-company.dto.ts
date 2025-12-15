import { IsOptional, IsString, MaxLength } from 'class-validator';

// 회사 수정 DTO
export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  status?: string;
}
