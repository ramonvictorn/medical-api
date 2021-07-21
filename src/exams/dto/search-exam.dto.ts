import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ExamStatus } from '../entities/exam.entity';

export class SearchExamDto {
  @IsEnum(ExamStatus)
  @IsString()
  @IsOptional()
  status: ExamStatus;
}
