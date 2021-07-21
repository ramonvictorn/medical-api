import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LaboratoryStatus } from '../entities/laboratory.entity';

export class CreateLaboratoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(LaboratoryStatus)
  @IsString()
  @IsOptional()
  status: LaboratoryStatus;
}
