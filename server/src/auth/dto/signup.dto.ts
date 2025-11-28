import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

// 회원가입 요청 DTO
export class SignupDto {
  @IsString()
  @IsNotEmpty({ message: '아이디를 입력하세요.' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '이름을 입력하세요.' })
  displayName: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호 확인을 입력하세요.' })
  passwordConfirm: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  companyName?: string;
}
