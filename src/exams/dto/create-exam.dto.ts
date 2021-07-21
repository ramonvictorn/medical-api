import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Laboratory } from 'src/laboratories/entities/laboratory.entity';
import { Exists } from 'src/validators/exists.rule';
import { ExamStatus, ExamType } from '../entities/exam.entity';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ExamType)
  @IsString()
  type: ExamType;

  @IsEnum(ExamStatus)
  @IsString()
  @IsOptional()
  status: ExamStatus;

  @Type(() => LaboratoryItemDto)
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @IsNotEmpty()
  laboratories: LaboratoryItemDto[];
}

class LaboratoryItemDto {
  @Exists(Laboratory)
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  laboratory_id: string;
}
