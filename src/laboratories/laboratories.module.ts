import { Module } from '@nestjs/common';
import { LaboratoriesService } from './laboratories.service';
import { LaboratoriesController } from './laboratories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratory } from './entities/laboratory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Laboratory])],
  controllers: [LaboratoriesController],
  providers: [LaboratoriesService],
})
export class LaboratoriesModule {}
