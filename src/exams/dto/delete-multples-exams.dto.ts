import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class RemoveMultilpleExamsSingleDto {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class RemoveMultiplesExamsDto {
  @Type(() => RemoveMultilpleExamsSingleDto)
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @IsNotEmpty()
  exams: RemoveMultilpleExamsSingleDto[];
}
