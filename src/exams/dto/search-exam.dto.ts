import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ExamStatus } from '../entities/exam.entity';

export class SearchExamDto {
  @IsEnum(ExamStatus)
  @IsString()
  @IsOptional()
  status?: ExamStatus;

  @IsString()
  @IsOptional()
  q?: string;

  @IsUUID('4')
  @IsString()
  @IsOptional()
  examId?: string;
}
