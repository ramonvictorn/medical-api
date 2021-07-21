import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateExamDto } from './create-exam.dto';

export class UpdateExamDto extends PartialType(CreateExamDto) {}

export class UpdateMultilpleExamSingleDto extends PartialType(CreateExamDto) {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class UpdateMultipleExamsDto {
  @Type(() => UpdateMultilpleExamSingleDto)
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @IsNotEmpty()
  exams: UpdateMultilpleExamSingleDto[];
}
