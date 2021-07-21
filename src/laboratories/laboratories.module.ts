import { Module } from '@nestjs/common';
import { LaboratoriesService } from './laboratories.service';
import { LaboratoriesController } from './laboratories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratory } from './entities/laboratory.entity';
import { LaboratoriesExams } from '../exams/entities/laboratories_exams.entity';
import { Exam } from '../exams/entities/exam.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Laboratory, LaboratoriesExams, Exam])],
  controllers: [LaboratoriesController],
  providers: [LaboratoriesService],
})
export class LaboratoriesModule {}
