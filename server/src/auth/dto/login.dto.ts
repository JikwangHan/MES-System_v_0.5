import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// 로그인 요청 DTO (회사코드는 선택 입력, 없으면 기본 회사 코드로 처리)
export class LoginDto {
  @IsString()
  @IsOptional()
  companyCode?: string;

  @IsString()
  @IsNotEmpty({ message: '아이디를 입력해 주세요.' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요.' })
  password: string;
}
