import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// 회사 생성 DTO
export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty({ message: '회사코드를 입력해 주세요.' })
  @MaxLength(50)
  code: string;

  @IsString()
  @IsNotEmpty({ message: '회사명을 입력해 주세요.' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  status?: string;
}
