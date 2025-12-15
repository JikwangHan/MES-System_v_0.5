import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  companyCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER'])
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
}
