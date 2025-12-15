import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminCreateUserDto {
  @IsString()
  @IsNotEmpty({ message: '아이디를 입력해 주세요.' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '이름을 입력해 주세요.' })
  displayName: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @IsString()
  @IsIn(['SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER'], { message: '역할은 SYSTEM_ADMIN/COMPANY_ADMIN/USER 중 하나여야 합니다.' })
  role: string;

  @IsString()
  @IsNotEmpty({ message: '회사코드를 입력해 주세요.' })
  companyCode: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
