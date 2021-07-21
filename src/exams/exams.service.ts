import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Laboratory,
  LaboratoryStatus,
} from 'src/laboratories/entities/laboratory.entity';
import { EntityNotFoundError, In, Repository } from 'typeorm';
import { CreateExamDto } from './dto/create-exam.dto';
import { SearchExamDto } from './dto/search-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam, ExamStatus } from './entities/exam.entity';
import { LaboratoriesExams } from './entities/laboratories_exams.entity';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Laboratory)
    private laboratoryRepository: Repository<Laboratory>,
    @InjectRepository(LaboratoriesExams)
    private laboratoriesExamsRepository: Repository<LaboratoriesExams>,
  ) {}

  async create(createExamDto: CreateExamDto) {
    const exam = this.examRepository.create(createExamDto);
    await this.examRepository.save(exam);

    if (
      !createExamDto.laboratories ||
      createExamDto.laboratories.length === 0
    ) {
      return;
    }

    const laboratoriesIds = createExamDto.laboratories.map(
      (lab) => lab.laboratory_id,
    );

    const message = [];
    const laboratories = await this.laboratoryRepository.find({
      where: {
        id: In(laboratoriesIds),
      },
    });

    const creationPromise = createExamDto.laboratories.map(
      async (laboratorie) => {
        const laboratoryId = laboratorie.laboratory_id;
        const laboratoryInfo = laboratories.find(
          (lab) => lab.id === laboratoryId,
        );

        if (
          laboratoryInfo &&
          laboratoryInfo.status === LaboratoryStatus.Active
        ) {
          await this.addExamToLaboratory(laboratoryId, exam.id);
        } else {
          message.push(
            `Laboratory ${laboratoryId} cannot be used, check the laboratory status`,
          );
        }
      },
    );

    await Promise.all(creationPromise);
    if (message.length) {
      return {
        message,
      };
    }
  }

  async findAll(query: SearchExamDto) {
    return this.getExamsWithLaboratoriesInfo(query);
  }

  findOne(id: number) {
    return `This action returns a #${id} exam`;
  }

  async update(id: string, updateExamDto: UpdateExamDto) {
    if (Object.keys(updateExamDto).length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          error: 'PROVIDE_AT_LEAT_ONE_FIELD_TO_UPDATE',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
    const updateResult = await this.examRepository.update(id, updateExamDto);
    if (!updateResult.affected) {
      throw new EntityNotFoundError(Exam, id);
    }
    return this.examRepository.findOne(id);
  }

  async remove(id: string) {
    const deleteResult = await this.examRepository.softDelete(id);

    if (!deleteResult.affected) {
      throw new EntityNotFoundError(Exam, id);
    }
  }

  async toggleExamOnLaboratory(examId: string, laboratoryId: string) {
    const [exam, laboratory] = await Promise.all([
      this.examRepository.findOne({ where: { id: examId } }),
      this.laboratoryRepository.findOne({ where: { id: laboratoryId } }),
    ]);

    if (!exam || exam.status !== ExamStatus.Active) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          error: 'EXAM_NOT_ACTIVE',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (!laboratory || laboratory.status !== LaboratoryStatus.Active) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          error: 'LABORATORY_NOT_ACTIVE',
        },
        HttpStatus.CONFLICT,
      );
    }

    const whereCondition = {
      exam_id: examId,
      laboratory_id: laboratoryId,
    };
    const exitentLaboratoryExam =
      await this.laboratoriesExamsRepository.findOne({
        where: whereCondition,
      });

    if (exitentLaboratoryExam) {
      await this.laboratoriesExamsRepository.delete(whereCondition);
      return { action: 'deleted' };
    } else {
      const laboratoryExam =
        this.laboratoriesExamsRepository.create(whereCondition);
      await this.laboratoriesExamsRepository.save(laboratoryExam);
      return { action: 'created' };
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

    if (filters.q) {
      query.andWhere('exams.name ilike :queryParam', {
        queryParam: `%${filters.q}%`,
      });
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
