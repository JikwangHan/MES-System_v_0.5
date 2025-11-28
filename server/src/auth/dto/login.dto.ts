import { IsNotEmpty, IsString } from 'class-validator';

// 로그인 요청 DTO
export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '아이디를 입력하세요.' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력하세요.' })
  password: string;
}
