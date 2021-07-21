import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LaboratoryStatus } from '../entities/laboratory.entity';

export class SearchLaboratoryDto {
  @IsEnum(LaboratoryStatus)
  @IsString()
  @IsOptional()
  status: LaboratoryStatus;
}
