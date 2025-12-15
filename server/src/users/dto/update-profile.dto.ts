import { IsOptional, IsString } from 'class-validator';

// 내 정보 수정 DTO: 아이디/권한 등은 수정 불가, 기본 정보만 수정
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  companyName?: string;
}
