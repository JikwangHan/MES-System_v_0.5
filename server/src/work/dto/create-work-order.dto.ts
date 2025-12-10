import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  itemCode?: string;

  @IsString()
  @IsOptional()
  itemName?: string;

  @IsInt()
  @Min(0)
  qty: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['PLANNED', 'IN_PROGRESS', 'DONE', 'HOLD', 'CANCEL'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  companyCode?: string; // SYSTEM_ADMIN일 때 지정 가능
}
