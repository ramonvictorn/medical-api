import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { Exam } from './entities/exam.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratory } from 'src/laboratories/entities/laboratory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, Laboratory])],
  controllers: [ExamsController],
  providers: [ExamsService],
})
export class ExamsModule {}
