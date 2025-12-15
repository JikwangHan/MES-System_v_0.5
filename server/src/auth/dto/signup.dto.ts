import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

// 회원가입 요청 DTO
export class SignupDto {
  @IsString()
  @IsOptional()
  companyCode?: string;

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
  @IsNotEmpty({ message: '비밀번호 확인을 입력해 주세요.' })
  passwordConfirm: string;

  // 회원 구분: 시스템관리자/관리자(운영자)/소상공인
  @IsString()
  @IsIn(['SYSTEM_ADMIN', 'ADMIN', 'COMPANY_ADMIN', 'USER'], { message: '회원구분은 SYSTEM_ADMIN/ADMIN/COMPANY_ADMIN/USER 중 하나여야 합니다.' })
  role: string;

  @IsString()
  @IsNotEmpty({ message: '업체명을 입력해 주세요.' })
  companyName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
