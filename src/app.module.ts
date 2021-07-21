import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LaboratoriesModule } from './laboratories/laboratories.module';
import { ExamsModule } from './exams/exams.module';
import { Exam } from './exams/entities/exam.entity';
import { LaboratoriesExams } from './exams/entities/laboratories_exams.entity';
import { Laboratory } from './laboratories/entities/laboratory.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.TYPEORM_CONNECTION as any,
      host: process.env.TYPEORM_HOST,
      port: parseInt(process.env.TYPEORM_PORT),
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      entities: [Exam, Laboratory, LaboratoriesExams],
      synchronize: true,
      logging: true,
    }),
    LaboratoriesModule,
    ExamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
