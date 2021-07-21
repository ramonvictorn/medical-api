import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Laboratory } from 'src/laboratories/entities/laboratory.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { CreateExamDto } from './dto/create-exam.dto';
import { SearchExamDto } from './dto/search-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from './entities/exam.entity';
import { LaboratoriesExams } from './entities/laboratories_exams.entity';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Laboratory)
    private laboratoryRepository: Repository<Laboratory>,
  ) {}

  async create(createExamDto: CreateExamDto) {
    const exam = this.examRepository.create(createExamDto);
    await this.examRepository.save(exam);

    const creationPromise = createExamDto.laboratories2.map(
      async (laboratorie) => {
        const laboratoryId = laboratorie.laboratory_id;
        await this.addExamToLaboratory(laboratoryId, exam.id);
      },
    );

    await Promise.all(creationPromise);
  }

  async findAll(query: SearchExamDto) {
    return this.getExamsWithLaboratoriesInfo(query);
  }

  findOne(id: number) {
    return `This action returns a #${id} exam`;
  }

  update(id: number, updateExamDto: UpdateExamDto) {
    return `This action updates a #${id} exam`;
  }

  async remove(id: string) {
    const deleteResult = await this.examRepository.delete(id);

    if (!deleteResult.affected) {
      throw new EntityNotFoundError(Laboratory, id);
    }
  }

  private async getExamsWithLaboratoriesInfo(filters: SearchExamDto) {
    const queryBuilder = this.examRepository.manager.createQueryBuilder();

    const query = queryBuilder
      .select(
        `
          exams.id
        , exams."name" 
        , exams.status 
        , exams."type" 
        , coalesce(json_agg(laboratories) filter (where laboratories.id is not null), '[]'::json) "laboratories"
        `,
      )
      .from(Exam, 'exams')
      .leftJoin(
        LaboratoriesExams,
        'laboratories_exams',
        'laboratories_exams.exam_id = exams.id',
      )
      .leftJoin(
        Laboratory,
        'laboratories',
        'laboratories.id = laboratories_exams.laboratory_id',
      )
      .groupBy('exams.id');

    if (filters.status) {
      query.where('exams.status = :examStatus', { examStatus: filters.status });
    }

    const exams = await query.getRawMany();
    return exams;
  }

  private async addExamToLaboratory(laboratoryId: string, examId: string) {
    const queryBuilder = this.examRepository.manager.createQueryBuilder();
    return queryBuilder
      .insert()
      .into(LaboratoriesExams)
      .values([
        {
          exam_id: examId,
          laboratory_id: laboratoryId,
        },
      ])
      .execute();
  }
}
