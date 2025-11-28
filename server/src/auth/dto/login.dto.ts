import { IsNotEmpty, IsString } from 'class-validator';

// 로그인 요청 DTO (회사코드 + 아이디 + 비밀번호)
export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '회사코드를 입력해 주세요.' })
  companyCode: string;

  @IsString()
  @IsNotEmpty({ message: '아이디를 입력해 주세요.' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요.' })
  password: string;
}
