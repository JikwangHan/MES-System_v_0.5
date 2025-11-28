import { IsNotEmpty, IsString, MinLength } from 'class-validator';

// 비밀번호 변경 요청 DTO
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: '현재 비밀번호를 입력하세요.' })
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: '새 비밀번호는 최소 8자 이상이어야 합니다.' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: '새 비밀번호 확인을 입력하세요.' })
  newPasswordConfirm: string;
}
