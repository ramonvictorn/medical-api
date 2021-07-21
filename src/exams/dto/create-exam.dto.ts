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
  @IsArray()
  @IsOptional()
  laboratories?: LaboratoryItemDto[];
}

export class LaboratoryItemDto {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  laboratory_id: string;
}

export class CreateMultipleExamDto {
  @Type(() => CreateExamDto)
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @IsNotEmpty()
  exams: CreateExamDto[];
}
