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
import { CreateExamDto, LaboratoryItemDto } from './create-exam.dto';

export class UpdateExamDto extends PartialType(CreateExamDto) {
  @Type(() => LaboratoryItemDto)
  @ValidateNested({ each: true })
  @IsArray()
  laboratories?: LaboratoryItemDto[];
}

export class UpdateMultilpleExamSingleDto extends PartialType(UpdateExamDto) {
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
